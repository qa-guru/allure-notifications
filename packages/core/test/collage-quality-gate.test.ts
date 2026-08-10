/**
 * T6 — quality-gate collage wire: kit profile draw, default silent-skip, missing data fail.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "core-collage",
  story: "Quality-gate collage wire",
  layer: "unit",
  component: "@qa-guru/allure-notifications-core",
  severity: "normal",
});

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseConfig, shouldSilentSkipKitOnlyItem } from "@qa-guru/allure-notifications-config";
import { QUALITY_GATE_TOKEN_PALETTE, renderQualityGatePng } from "../src/collage/panels/qualityGate.js";
import { KIT_DARK_TOKEN_PALETTE } from "../src/theme.js";
import {
  QualityGateDataMissingError,
  loadQualityGateCollageData,
  resolveQualityGatePanelId,
} from "../src/collage/qualityGateData.js";
import {
  buildAnalytics,
  readAllureResults,
  readSummary,
  renderCollagePng,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");
const SUCCESS = QUALITY_GATE_TOKEN_PALETTE["--color-success"]!;
const DARK_SURFACE = KIT_DARK_TOKEN_PALETTE["--color-surface"]!;

const QG_ITEMS = [
  { id: "allureQualityGate", type: "qualityGate", x: 0, y: 0, w: 5, h: 4 },
  { id: "sonarQualityGate", type: "qualityGate", x: 5, y: 0, w: 5, h: 4 },
] as const;

function kitConfig(extraChart: Record<string, unknown> = {}) {
  return parseConfig({
    base: {
      project: "qg-collage",
      allureFolder: join(fixtures, "allure3-report"),
      allureResultsFolder: join(fixtures, "allure-results"),
      enableChart: true,
      darkMode: true,
      chart: {
        profile: "kit",
        mode: "collage",
        layout: "free",
        width: 870,
        height: 540,
        headerHeight: 34,
        cardGap: 14,
        gridCols: 10,
        gridRows: 10,
        allureQualityGatePath: join(fixtures, "quality-gate/aqg-passed.json"),
        sonarQualityGatePath: join(fixtures, "sonar/project-status-passed.json"),
        items: [...QG_ITEMS],
        ...extraChart,
      },
    },
  });
}

async function countNearColor(
  png: Buffer,
  target: { r: number; g: number; b: number },
  tol = 12,
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

async function countNearWhite(png: Buffer, tol = 8, step = 2): Promise<number> {
  return countNearColor(png, { r: 255, g: 255, b: 255 }, tol, step);
}

async function avgRowRgb(png: Buffer, y: number): Promise<{ r: number; g: number; b: number }> {
  const img = await loadImage(png);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const row = Math.min(img.height - 1, Math.max(0, y));
  const { data } = ctx.getImageData(0, row, img.width, 1);
  let r = 0;
  let g = 0;
  let b = 0;
  const n = img.width;
  for (let x = 0; x < n; x++) {
    const i = x * 4;
    r += data[i]!;
    g += data[i + 1]!;
    b += data[i + 2]!;
  }
  return { r: r / n, g: g / n, b: b / n };
}

describe("quality-gate collage wire", () => {
  it("resolveQualityGatePanelId distinguishes AQG vs SQG catalog ids", () => {
    assert.equal(
      resolveQualityGatePanelId({ type: "qualityGate", id: "allureQualityGate", x: 0, y: 0, w: 1, h: 1 }),
      "allureQualityGate",
    );
    assert.equal(
      resolveQualityGatePanelId({ type: "qualityGate", id: "sonarQualityGate", x: 0, y: 0, w: 1, h: 1 }),
      "sonarQualityGate",
    );
    assert.equal(
      resolveQualityGatePanelId({ type: "qualityGate", x: 0, y: 0, w: 1, h: 1 }),
      null,
    );
  });

  it("loadQualityGateCollageData loads AQG file + maps Sonar projectStatus", async () => {
    const config = kitConfig();
    const data = await loadQualityGateCollageData(config);
    assert.equal(data.allureQualityGate?.passed, true);
    assert.equal(data.sonarQualityGate?.kind, "sonar");
    assert.ok((data.sonarQualityGate?.rules.length ?? 0) >= 1);
  });

  it("profile=kit renders both QG tiles with success pixels", async () => {
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const qualityGates = await loadQualityGateCollageData(config);
    const png = await renderCollagePng(config, analytics, qualityGates);

    assert.ok(png.length > 2000);
    const green = await countNearColor(png, SUCCESS, 12, 1);
    assert.ok(green >= 30, `expected QG success indicator pixels, got ${green}`);
  });

  it("collage paints macOS card dots on quality-gate tiles", async () => {
    // Dark theme card chrome mixes DOT_CLOSE (#ff5f57) with headerBg (60,60,60) @ 0.55.
    const macCloseMixed = { r: 167, g: 79, b: 75 };
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const qualityGates = await loadQualityGateCollageData(config);
    const png = await renderCollagePng(config, analytics, qualityGates);
    const dots = await countNearColor(png, macCloseMixed, 8, 1);
    assert.ok(dots >= 20, `expected macOS close-dot chrome on QG tiles, got ${dots}`);
  });

  it("dark collage QG body uses dark kit surface — not near-white", async () => {
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const qualityGates = await loadQualityGateCollageData(config);
    const png = await renderCollagePng(config, analytics, qualityGates);

    const white = await countNearWhite(png, 8, 1);
    assert.ok(white < 30, `dark collage must not paint near-white kit bodies, got ${white}`);

    const dark = await countNearColor(png, DARK_SURFACE, 8, 1);
    assert.ok(dark >= 80, `expected dark kit surface pixels in QG tiles, got ${dark}`);
  });

  it("collage QG body-only PNG has no second quality-gate title band", async () => {
    const config = kitConfig();
    const qualityGates = await loadQualityGateCollageData(config);
    const data = qualityGates.allureQualityGate!;
    const bodyPng = renderQualityGatePng(data, {
      width: 400,
      height: 160,
      chrome: "body",
      dark: true,
    });
    const hybridPng = renderQualityGatePng(data, {
      width: 400,
      height: 160,
      chrome: "hybrid",
      dark: true,
    });

    const bodyTop = await avgRowRgb(bodyPng, 12);
    const bodyUpper = await avgRowRgb(bodyPng, 40);
    assert.ok(
      Math.abs(bodyTop.r - bodyUpper.r) < 6 &&
        Math.abs(bodyTop.g - bodyUpper.g) < 6 &&
        Math.abs(bodyTop.b - bodyUpper.b) < 6,
      "body chrome must not paint a distinct bar band under macOS header",
    );

    const hybridBar = await avgRowRgb(hybridPng, 12);
    const hybridBody = await avgRowRgb(hybridPng, 80);
    assert.ok(
      Math.abs(hybridBar.r - hybridBody.r) > 4 ||
        Math.abs(hybridBar.g - hybridBody.g) > 4 ||
        Math.abs(hybridBar.b - hybridBody.b) > 4,
      "hybrid chrome must keep its own bar band for editor path",
    );
  });

  it("profile=default silent-skips QG items (no throw, smaller PNG)", async () => {
    const config = parseConfig({
      base: {
        project: "qg-skip",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        chart: {
          profile: "default",
          mode: "collage",
          layout: "free",
          width: 870,
          height: 540,
          headerHeight: 34,
          cardGap: 14,
          gridCols: 10,
          gridRows: 10,
          items: [...QG_ITEMS],
        },
      },
    });
    for (const item of QG_ITEMS) {
      assert.equal(shouldSilentSkipKitOnlyItem("default", item), true);
    }

    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const qualityGates = await loadQualityGateCollageData(config);
    assert.deepEqual(qualityGates, {});

    const png = await renderCollagePng(config, analytics, qualityGates);
    const green = await countNearColor(png, SUCCESS, 12, 1);
    assert.equal(green, 0, "default profile must not paint QG tiles");
  });

  it("profile=kit + missing sonar path fails closed", async () => {
    const config = parseConfig({
      base: {
        project: "qg-collage",
        enableChart: true,
        chart: {
          profile: "kit",
          mode: "collage",
          layout: "free",
          width: 870,
          height: 540,
          gridCols: 10,
          gridRows: 10,
          allureQualityGatePath: join(fixtures, "quality-gate/aqg-passed.json"),
          items: [{ id: "sonarQualityGate", type: "qualityGate", x: 0, y: 0, w: 5, h: 4 }],
        },
      },
    });
    await assert.rejects(
      () => loadQualityGateCollageData(config),
      (err: unknown) => {
        assert.ok(err instanceof QualityGateDataMissingError);
        assert.equal(err.panelId, "sonarQualityGate");
        return true;
      },
    );
  });

  it("profile=kit + missing AQG payload fails closed", async () => {
    const config = kitConfig({
      allureQualityGatePath: join(fixtures, "missing-aqg.json"),
      items: [{ id: "allureQualityGate", type: "qualityGate", x: 0, y: 0, w: 5, h: 4 }],
    });
    await assert.rejects(
      () => loadQualityGateCollageData(config),
      (err: unknown) => err instanceof QualityGateDataMissingError,
    );
  });
});

describe("quality-gate collage wire — sonar mapper", () => {
  it("fixture projectStatus maps to kit-compatible payload", async () => {
    const raw = JSON.parse(
      readFileSync(join(fixtures, "sonar/project-status-passed.json"), "utf8"),
    );
    const config = kitConfig();
    config.base.chart!.sonarQualityGatePath = join(
      fixtures,
      "sonar/project-status-passed.json",
    );
    const data = await loadQualityGateCollageData({
      ...config,
      base: {
        ...config.base,
        chart: {
          ...config.base.chart!,
          items: [{ id: "sonarQualityGate", type: "qualityGate", x: 0, y: 0, w: 5, h: 4 }],
        },
      },
    });
    assert.equal(data.sonarQualityGate?.passed, true);
    assert.equal(data.sonarQualityGate?.rules[0]?.id, "coverage");
  });
});
