import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@allure-notifications/test-meta";

declareSuite({
  feature: "core-collage",
  story: "Analytics panels render",
  layer: "unit",
  component: "@allure-notifications/core",
  severity: "normal",
});

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseConfig } from "@allure-notifications/config";

import {
  DEFAULT_TOP_SUITES,
  STATUS_KEYS,
  SUCCESS_BUCKETS,
  buildAnalytics,
  historyFromRuns,
  orderedSeverities,
  readAllureResults,
  readHistoryFile,
  readSummary,
  renderCollagePng,
  renderSeveritiesPanel,
  renderStatusDynamicsPanel,
  renderSuccessRateDistributionPanel,
  renderSuitesPanel,
  stackedSegmentHeights,
  themeFromDarkMode,
} from "../src/index.js";
import { panelContext } from "../src/collage/context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

async function pngSize(png: Buffer): Promise<{ w: number; h: number }> {
  const img = await loadImage(png);
  return { w: img.width, h: img.height };
}

async function countNearColor(
  png: Buffer,
  target: { r: number; g: number; b: number },
  tol = 8,
  step = 2,
): Promise<number> {
  const img = await loadImage(png);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  let count = 0;
  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const i = (y * img.width + x) * 4;
      if (
        Math.abs(data[i]! - target.r) <= tol &&
        Math.abs(data[i + 1]! - target.g) <= tol &&
        Math.abs(data[i + 2]! - target.b) <= tol
      ) {
        count++;
      }
    }
  }
  return count;
}

async function hasNonBackgroundPixels(png: Buffer): Promise<boolean> {
  const img = await loadImage(png);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const br = data[0]!;
  const bg = data[1]!;
  const bb = data[2]!;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] !== br || data[i + 1] !== bg || data[i + 2] !== bb) {
      return true;
    }
  }
  return false;
}

describe("@allure-notifications/core analytics history", () => {
  it("history buckets: statusDynamics + successRateDistribution", async () => {
    const runs = await readHistoryFile(join(fixtures, "history.jsonl"), 20);
    assert.equal(runs.length, 3);
    const history = historyFromRuns(runs);
    assert.equal(history.runCount, 3);
    assert.equal(history.statusDynamics.length, 3);
    assert.equal(history.successRateDistribution.length, SUCCESS_BUCKETS);

    // run1: passed=2 failed=1 broken=1
    assert.equal(history.statusDynamics[0]!.passed, 2);
    assert.equal(history.statusDynamics[0]!.failed, 1);
    assert.equal(history.statusDynamics[0]!.broken, 1);
    for (const key of STATUS_KEYS) {
      assert.ok(key in history.statusDynamics[0]!);
    }

    // a:2/3→6; b:1/3→3; c:2/3→6; d:0/1→0; e:0/2→0; f:1/1→9
    assert.equal(history.successRateDistribution[0], 2);
    assert.equal(history.successRateDistribution[3], 1);
    assert.equal(history.successRateDistribution[6], 2);
    assert.equal(history.successRateDistribution[9], 1);
  });

  it("severities ordered blocker→trivial then extras alpha", () => {
    const ordered = orderedSeverities({
      trivial: 1,
      blocker: 2,
      custom: 3,
      critical: 4,
      aaa: 1,
    });
    assert.deepEqual(
      ordered.map(([k]) => k),
      ["blocker", "critical", "trivial", "aaa", "custom"],
    );
  });

  it("suites capped at DEFAULT_TOP_SUITES", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = [];
    for (let i = 0; i < 15; i++) {
      results.push({
        name: `t${i}`,
        labels: [{ name: "suite", value: `Suite-${String(i).padStart(2, "0")}` }],
      });
    }
    // Extra hits on Suite-00 so sort is stable by count then name
    results.push({
      name: "extra",
      labels: [{ name: "suite", value: "Suite-00" }],
    });
    const analytics = buildAnalytics(summary, results, DEFAULT_TOP_SUITES);
    assert.equal(analytics.suites.length, DEFAULT_TOP_SUITES);
    assert.equal(analytics.suites[0]!.name, "Suite-00");
    assert.equal(analytics.suites[0]!.count, 2);
  });

  it("stackedSegmentHeights fills plot exactly", () => {
    const heights = stackedSegmentHeights(55, [50, 3, 3, 2, 2]);
    assert.equal(heights.reduce((a, b) => a + b, 0), 55);
    for (const h of heights) {
      assert.ok(h >= 1);
    }
  });
});

describe("@allure-notifications/core analytics panels render", () => {
  async function baseAnalytics(withHistory: boolean) {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const history = withHistory
      ? historyFromRuns(await readHistoryFile(join(fixtures, "history.jsonl")))
      : null;
    return buildAnalytics(summary, results, DEFAULT_TOP_SUITES, history);
  }

  function bareConfig() {
    return parseConfig({
      base: {
        project: "analytics",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: { pyramidFallback: "suites" },
      },
    });
  }

  it("testResultSeverities → PNG with data (not empty-marker-only)", async () => {
    const analytics = await baseAnalytics(false);
    assert.ok(Object.keys(analytics.severities).length >= 2);
    const theme = themeFromDarkMode(true);
    const ctx = panelContext(bareConfig(), theme, 400, 220, analytics, {
      showTitle: false,
    });
    const png = renderSeveritiesPanel(ctx);
    assert.ok(png.length > 0);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const size = await pngSize(png);
    assert.equal(size.w, 400);
    assert.ok(await hasNonBackgroundPixels(png));
    // Severity pills (blocker/critical/normal) — not empty-state marker-only.
    const blocker = await countNearColor(png, { r: 0xc0, g: 0x39, b: 0x2b }, 20, 1);
    const critical = await countNearColor(png, { r: 0xfd, g: 0x5a, b: 0x3e }, 40, 1);
    assert.ok(
      blocker + critical > 20,
      `expected severity bar colors, blocker=${blocker} critical=${critical}`,
    );
  });

  it("suites → PNG with data", async () => {
    const analytics = await baseAnalytics(false);
    assert.ok(analytics.suites.length >= 1);
    const theme = themeFromDarkMode(true);
    const ctx = panelContext(bareConfig(), theme, 400, 220, analytics);
    const png = renderSuitesPanel(ctx);
    assert.ok(png.length > 0);
    assert.ok(await hasNonBackgroundPixels(png));
  });

  it("statusDynamics / successRate with history → PNG data", async () => {
    const analytics = await baseAnalytics(true);
    assert.equal(analytics.history?.runCount, 3);
    const theme = themeFromDarkMode(true);
    const config = bareConfig();
    const dyn = renderStatusDynamicsPanel(
      panelContext(config, theme, 400, 220, analytics),
    );
    const rate = renderSuccessRateDistributionPanel(
      panelContext(config, theme, 400, 220, analytics),
    );
    assert.ok(dyn.length > 0);
    assert.ok(rate.length > 0);
    assert.ok(await hasNonBackgroundPixels(dyn));
    assert.ok(await hasNonBackgroundPixels(rate));
    // passed green in stacked bars
    const green = await countNearColor(dyn, { r: 0x94, g: 0xca, b: 0x66 }, 12, 1);
    assert.ok(green > 10, `expected STATUS_PASSED green in dynamics, got ${green}`);
  });

  it("history panels empty path without history (no throw)", async () => {
    const analytics = await baseAnalytics(false);
    assert.equal(analytics.history, null);
    const theme = themeFromDarkMode(true);
    const config = bareConfig();
    const dyn = renderStatusDynamicsPanel(
      panelContext(config, theme, 300, 180, analytics),
    );
    const rate = renderSuccessRateDistributionPanel(
      panelContext(config, theme, 300, 180, analytics),
    );
    assert.ok(dyn.length > 0);
    assert.ok(rate.length > 0);
    // Text placeholder — no empty-state muted marker bar required
    const size = await pngSize(dyn);
    assert.equal(size.w, 300);
  });

  it("collage mix: pie+pyramid+durations+4 analytics panels", async () => {
    const analytics = await baseAnalytics(true);
    const config = parseConfig({
      base: {
        project: "mix",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 1000,
          height: 800,
          headerHeight: 34,
          cardGap: 14,
          gridCols: 10,
          gridRows: 10,
          pyramidFallback: "suites",
          items: [
            { type: "currentStatus", x: 0, y: 0, w: 3, h: 3 },
            { type: "testingPyramid", x: 3, y: 0, w: 3, h: 3 },
            { type: "durations", x: 6, y: 0, w: 4, h: 3 },
            { type: "testResultSeverities", x: 0, y: 3, w: 3, h: 3 },
            { type: "suites", x: 3, y: 3, w: 3, h: 3 },
            { type: "statusDynamics", x: 6, y: 3, w: 2, h: 3 },
            { type: "successRateDistribution", x: 8, y: 3, w: 2, h: 3 },
          ],
        },
      },
    });
    const png = await renderCollagePng(config, analytics);
    const size = await pngSize(png);
    assert.equal(size.w, 1000);
    assert.equal(size.h, 800);
    assert.ok(png.length > 2000);
    const unitGreen = await countNearColor(png, { r: 0x94, g: 0xca, b: 0x66 });
    assert.ok(unitGreen > 30, `mix must paint #94ca66, got ${unitGreen}`);
  });

  it("aliases severities/severity resolve; pyramidFallback suites when no known layers", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const analytics = buildAnalytics(summary, [
      {
        name: "no-layer",
        labels: [
          { name: "suite", value: "OnlySuite" },
          { name: "severity", value: "critical" },
        ],
      },
    ]);
    assert.equal(analytics.hasKnownLayerLabels, false);
    const config = parseConfig({
      base: {
        project: "fallback",
        allureFolder: "a",
        allureResultsFolder: "r",
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 600,
          height: 400,
          headerHeight: 34,
          cardGap: 10,
          gridCols: 6,
          gridRows: 4,
          pyramidFallback: "suites",
          items: [
            { type: "testingPyramid", x: 0, y: 0, w: 3, h: 4 },
            { type: "severities", x: 3, y: 0, w: 3, h: 2 },
            { type: "severity", x: 3, y: 2, w: 3, h: 2 },
          ],
        },
      },
    });
    const png = await renderCollagePng(config, analytics);
    assert.ok(png.length > 500);
    // Suites fallback uses accent blue pills on dark theme
    const accent = await countNearColor(png, { r: 59, g: 130, b: 246 }, 20, 2);
    assert.ok(accent > 5, `expected suites accent bars, got ${accent}`);
  });
});
