/**
 * Catalog panels beyond Java 5.0 stubs — analytics buckets + PNG + collage mix.
 */

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseConfig, type ChartItem } from "@allure-notifications/config";

import {
  DEFAULT_TOP_SUITES,
  buildAnalytics,
  historyFromRuns,
  readAllureResults,
  readHistoryFile,
  readSummary,
  renderCollagePng,
  renderCoverageDiffPanel,
  renderDurationDynamicsPanel,
  renderProblemsDistributionPanel,
  renderStabilityDistributionPanel,
  renderStatusAgePyramidPanel,
  renderStatusTransitionsPanel,
  renderTestBaseGrowthPanel,
  resolveGroupByLabel,
  stabilityBarsFromCases,
  themeFromDarkMode,
} from "../src/index.js";
import { panelContext } from "../src/collage/context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

async function pngSize(png: Buffer): Promise<{ w: number; h: number }> {
  const img = await loadImage(png);
  return { w: img.width, h: img.height };
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

describe("@allure-notifications/core catalog stub → real analytics", () => {
  it("history derives transitions / growth / coverage / problems / durations / age", async () => {
    const runs = await readHistoryFile(join(fixtures, "history.jsonl"), 20);
    const history = historyFromRuns(runs);
    assert.equal(history.runCount, 3);

    // r1→r2: b failed→passed (fixed); c passed→broken (malfunctioned); d removed; e added
    assert.equal(history.statusTransitions.length, 2);
    assert.equal(history.statusTransitions[0]!.fixed, 1);
    assert.equal(history.statusTransitions[0]!.malfunctioned, 1);
    // r2→r3: a passed→failed (regressed); c broken→passed (fixed)
    assert.equal(history.statusTransitions[1]!.regressed, 1);
    assert.equal(history.statusTransitions[1]!.fixed, 1);

    assert.equal(history.testBaseGrowth.length, 2);
    // r1→r2: +e −d
    assert.equal(history.testBaseGrowth[0]!.added, 1);
    assert.equal(history.testBaseGrowth[0]!.removed, 1);
    // r2→r3: +f
    assert.equal(history.testBaseGrowth[1]!.added, 1);

    assert.ok(history.coverageDiff.length >= 1);
    assert.ok(history.problemsByEnvironment.environments.includes("chrome"));
    assert.ok(history.problemsByEnvironment.environments.includes("safari"));
    assert.equal(history.durationDynamics.length, 3);
    assert.ok(history.durationDynamics.every((d) => d >= 0));

    const ageTotal = history.statusAgePyramid.reduce(
      (s, b) => s + b.failed + b.broken + b.skipped + b.unknown,
      0,
    );
    assert.ok(ageTotal >= 1);

    assert.ok(history.stabilityCases.length >= 1);
    const featureBars = stabilityBarsFromCases(
      history.stabilityCases,
      "feature",
    );
    assert.ok(featureBars.length >= 1);
    const componentBars = stabilityBarsFromCases(
      history.stabilityCases,
      "label-name:component",
    );
    assert.ok(componentBars.length >= 1);
    assert.equal(resolveGroupByLabel("label-name:component"), "component");
    assert.equal(resolveGroupByLabel("epic"), "epic");
  });

  it("stability groupBy from current results when no history", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = [
      {
        name: "t1",
        status: "passed",
        labels: [{ name: "feature", value: "A" }],
      },
      {
        name: "t2",
        status: "failed",
        labels: [{ name: "feature", value: "A" }],
      },
      {
        name: "t3",
        status: "passed",
        labels: [{ name: "feature", value: "B" }],
      },
    ];
    const analytics = buildAnalytics(summary, results);
    const bars = stabilityBarsFromCases(analytics.stabilityCases, "feature");
    assert.equal(bars.length, 2);
    const b = bars.find((x) => x.name === "B");
    assert.ok(b);
    assert.equal(b!.rate, 100);
    const a = bars.find((x) => x.name === "A");
    assert.ok(a);
    assert.equal(a!.rate, 50);
  });
});

describe("@allure-notifications/core catalog panels PNG", () => {
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
        project: "catalog",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: { pyramidFallback: "suites" },
      },
    });
  }

  const renderers: Array<{
    name: string;
    render: (ctx: ReturnType<typeof panelContext>) => Buffer;
    groupBy?: string;
    by?: string;
  }> = [
    { name: "statusTransitions", render: renderStatusTransitionsPanel },
    { name: "testBaseGrowthDynamics", render: renderTestBaseGrowthPanel },
    { name: "coverageDiff", render: renderCoverageDiffPanel },
    {
      name: "problemsDistribution",
      render: renderProblemsDistributionPanel,
      by: "environment",
    },
    {
      name: "stabilityDistribution",
      render: renderStabilityDistributionPanel,
      groupBy: "feature",
    },
    { name: "durationDynamics", render: renderDurationDynamicsPanel },
    { name: "statusAgePyramid", render: renderStatusAgePyramidPanel },
  ];

  for (const panel of renderers) {
    it(`${panel.name} → PNG with history data`, async () => {
      const analytics = await baseAnalytics(true);
      const theme = themeFromDarkMode(true);
      const ctx = panelContext(bareConfig(), theme, 400, 220, analytics, {
        showTitle: false,
        groupBy: panel.groupBy,
        by: panel.by,
      });
      const png = panel.render(ctx);
      assert.ok(png.length > 0);
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      const size = await pngSize(png);
      assert.equal(size.w, 400);
      assert.ok(await hasNonBackgroundPixels(png));
    });

    it(`${panel.name} empty path without history (no throw)`, async () => {
      const analytics = await baseAnalytics(false);
      const theme = themeFromDarkMode(true);
      const ctx = panelContext(bareConfig(), theme, 300, 180, analytics, {
        groupBy: panel.groupBy,
        by: panel.by,
      });
      // stability can still paint from current results
      const png = panel.render(ctx);
      assert.ok(png.length > 0);
      const size = await pngSize(png);
      assert.equal(size.w, 300);
    });
  }

  it("dense SQ-1080 mix real+remaining paints collage", async () => {
    const analytics = await baseAnalytics(true);
    const items: ChartItem[] = [
      { type: "pie", x: 0, y: 0, w: 2, h: 2 },
      { type: "testingPyramid", x: 2, y: 0, w: 2, h: 2 },
      { type: "durations", x: 4, y: 0, w: 2, h: 2 },
      { type: "statusDynamics", x: 6, y: 0, w: 2, h: 2 },
      { type: "statusTransitions", x: 8, y: 0, w: 2, h: 2 },
      { type: "testBaseGrowthDynamics", x: 0, y: 2, w: 2, h: 2 },
      { type: "coverageDiff", x: 2, y: 2, w: 2, h: 2 },
      {
        type: "problemsDistribution",
        x: 4,
        y: 2,
        w: 2,
        h: 2,
        by: "environment",
      },
      {
        type: "stabilityDistribution",
        x: 6,
        y: 2,
        w: 2,
        h: 2,
        groupBy: "feature",
      },
      { type: "durationDynamics", x: 8, y: 2, w: 2, h: 2 },
      { type: "statusAgePyramid", x: 0, y: 4, w: 3, h: 3 },
      { type: "successRateDistribution", x: 3, y: 4, w: 3, h: 3 },
      { type: "testResultSeverities", x: 6, y: 4, w: 4, h: 3 },
      // unknown stays empty-state
      { type: "totallyUnknownPanel", x: 0, y: 7, w: 2, h: 2 },
    ];
    const config = parseConfig({
      base: {
        project: "dense-catalog",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 1080,
          height: 1080,
          headerHeight: 34,
          cardGap: 14,
          gridCols: 10,
          gridRows: 10,
          pyramidFallback: "suites",
          items,
        },
      },
    });
    const png = await renderCollagePng(config, analytics);
    const size = await pngSize(png);
    assert.equal(size.w, 1080);
    assert.equal(size.h, 1080);
    const unitGreen = await countNearColor(png, { r: 0x94, g: 0xca, b: 0x66 });
    assert.ok(unitGreen > 30, `mix must paint #94ca66, got ${unitGreen}`);
    // Unknown tile keeps empty-state muted marker.
    const muted = await countNearColor(png, { r: 150, g: 150, b: 150 }, 8, 2);
    assert.ok(muted > 20, `unknown empty-state marker expected, got ${muted}`);
  });
});
