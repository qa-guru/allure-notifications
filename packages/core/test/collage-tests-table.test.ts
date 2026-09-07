/**
 * Tests-table collage wire: kit profile draw, default silent-skip, missing data fail.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "core-collage",
  story: "Tests-table collage wire",
  layer: "unit",
  component: "@qa-guru/allure-notifications-core",
  severity: "normal",
});

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseConfig, shouldSilentSkipKitOnlyItem } from "@qa-guru/allure-notifications-config";
import { TESTS_TABLE_TOKEN_PALETTE, renderTestsTablePng, testsTableColumnLayout } from "../src/collage/panels/testsTable.js";
import { KIT_DARK_TOKEN_PALETTE } from "../src/theme.js";
import {
  TestsTableDataMissingError,
  isKitTestsTableData,
  loadTestsTableCollageData,
  parseKitTestsTableData,
} from "../src/collage/testsTableData.js";
import {
  buildAnalytics,
  readAllureResults,
  readSummary,
  renderCollagePng,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");
const TABLE_FIXTURE = join(fixtures, "tests-table/tests-table-panel.json");
const SUCCESS = TESTS_TABLE_TOKEN_PALETTE["--color-success"]!;
const DARK_SURFACE = KIT_DARK_TOKEN_PALETTE["--color-surface"]!;

const TABLE_ITEM = {
  id: "testsTable",
  type: "testsTable",
  x: 0,
  y: 0,
  w: 10,
  h: 10,
} as const;

function kitConfig(extraChart: Record<string, unknown> = {}) {
  return parseConfig({
    base: {
      project: "tests-table-collage",
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
        testsTablePath: TABLE_FIXTURE,
        items: [TABLE_ITEM],
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

function aHash16(png: Buffer): string {
  return createHash("sha256").update(png).digest("hex").slice(0, 16);
}

describe("tests-table collage wire", () => {
  it("parseKitTestsTableData accepts kit fixture", () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    assert.equal(data.rows.length, 5);
    assert.equal(data.lang, "ru");
  });

  it("parseKitTestsTableData rejects bad lang, columns, history, and flakyFlips", () => {
    const row = { name: "t", status: "passed" };
    assert.equal(isKitTestsTableData({ rows: [row], lang: "de" }), false);
    assert.equal(isKitTestsTableData({ rows: [row], columns: [1] }), false);
    assert.equal(isKitTestsTableData({ rows: [{ name: "t", status: "passed", history: "x" }] }), false);
    assert.equal(
      isKitTestsTableData({
        rows: [{ name: "t", status: "passed", history: [{ status: 1 }] }],
      }),
      false,
    );
    assert.equal(
      isKitTestsTableData({
        rows: [{ name: "t", status: "passed", history: [{ durationSec: "1" }] }],
      }),
      false,
    );
    assert.equal(
      isKitTestsTableData({ rows: [{ name: "t", status: "passed", flakyFlips: "2" }] }),
      false,
    );
    assert.equal(isKitTestsTableData({ rows: [row], columns: ["Test"] }), true);
    assert.equal(isKitTestsTableData(null), false);
    assert.equal(isKitTestsTableData([]), false);
    assert.equal(isKitTestsTableData({}), false);
    assert.equal(isKitTestsTableData({ rows: [{ status: "passed" }] }), false);
    assert.equal(isKitTestsTableData({ rows: [{ name: "t" }] }), false);
    assert.equal(
      isKitTestsTableData({ rows: [{ name: "t", status: "passed", history: [null] }] }),
      false,
    );
    assert.equal(isKitTestsTableData({ rows: [null] }), false);
    assert.equal(isKitTestsTableData({ rows: ["row"] }), false);
    const missing = new TestsTableDataMissingError();
    assert.match(missing.message, /tests table data missing;/);
    assert.equal(missing.path, undefined);
    assert.throws(() => parseKitTestsTableData({ rows: "nope" }), TypeError);
  });

  it("renderTestsTablePng paints empty-rows placeholder and empty sparkline", () => {
    const empty = renderTestsTablePng(
      { lang: "en", rows: [] },
      { width: 420, height: 180, dark: false },
    );
    assert.equal(empty.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const spark = renderTestsTablePng(
      {
        lang: "en",
        rows: [{ name: "solo", status: "passed", history: [], flakyFlips: 0 }],
      },
      { width: 420, height: 80, dark: false },
    );
    assert.ok(spark.length > 200);

    const longName = renderTestsTablePng(
      {
        lang: "en",
        rows: [
          {
            name: "VeryLongTestNameThatMustEllipsizeInANarrowColumn".repeat(4),
            status: "unknown",
            history: Array.from({ length: 40 }, () => ({ status: "passed", durationSec: 1 })),
          },
          { name: "", fullName: "suite.fallbackName", status: "custom-status" },
        ],
      },
      { width: 220, height: 90, dark: false },
    );
    assert.ok(longName.length > 200);

    const defaults = renderTestsTablePng({ rows: [] }, { width: 200, height: 80 });
    assert.ok(defaults.length > 100);
    const noRowsField = renderTestsTablePng(
      { rows: undefined as unknown as [] },
      { width: 200, height: 80 },
    );
    assert.ok(noRowsField.length > 100);
    const labeled = renderTestsTablePng(
      { rows: [], emptyRowsLabel: { ru: "Пусто" } },
      { width: 200, height: 80 },
    );
    assert.ok(labeled.length > 100);
    const shortCols = renderTestsTablePng(
      {
        rows: [
          {
            name: "",
            status: "not-a-status",
            history: [{}, { status: "" }],
          },
        ],
        columns: [],
      },
      { width: 48, height: 80 },
    );
    assert.ok(shortCols.length > 100);

    const defaultsAndFalsy = renderTestsTablePng(
      {
        rows: [
          { name: "no-history", status: "" },
          {
            name: "spark",
            status: "passed",
            history: [
              { status: undefined, durationSec: 1.1 },
              { status: "", durationSec: 2.2 },
              { status: "passed", durationSec: 1.4 },
            ],
          },
        ],
      },
      { width: 640, height: 120, palette: {} },
    );
    assert.ok(defaultsAndFalsy.length > 100);
  });

  it("renderTestsTablePng yields non-empty PNG from fixture", () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    const png = renderTestsTablePng(data, { width: 420, height: 280, dark: true });
    assert.ok(png.length > 2000);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  });

  it("loadTestsTableCollageData loads explicit path", async () => {
    const config = kitConfig();
    const data = await loadTestsTableCollageData(config);
    assert.ok(data);
    assert.equal(data?.rows.length, 5);
  });

  it("loadTestsTableCollageData reads report widget when path omitted", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-table-widget-"));
    const widgets = join(dir, "widgets", "kit-panels");
    await mkdir(widgets, { recursive: true });
    await writeFile(join(widgets, "testsTable.json"), readFileSync(TABLE_FIXTURE));
    try {
      const config = kitConfig();
      delete config.base.chart!.testsTablePath;
      config.base.allureFolder = dir;
      const data = await loadTestsTableCollageData(config);
      assert.equal(data?.rows.length, 5);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("loadTestsTableCollageData returns undefined when items omitted", async () => {
    const config = kitConfig();
    delete config.base.chart!.items;
    assert.equal(await loadTestsTableCollageData(config), undefined);
  });

  it("loadTestsTableCollageData uses default allure-report folder when omitted", async () => {
    const config = kitConfig();
    delete config.base.chart!.testsTablePath;
    delete config.base.allureFolder;
    await assert.rejects(
      () => loadTestsTableCollageData(config),
      (err: unknown) => err instanceof TestsTableDataMissingError,
    );
  });

  it("profile=kit renders testsTable tile with table pixels", async () => {
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const testsTable = await loadTestsTableCollageData(config);
    const png = await renderCollagePng(config, analytics, {}, testsTable);

    assert.ok(png.length > 2000);
    const green = await countNearColor(png, SUCCESS, 12, 1);
    assert.ok(green >= 5, `expected status badge pixels, got ${green}`);
  });

  it("dark collage testsTable body uses dark kit surface — not near-white", async () => {
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const testsTable = await loadTestsTableCollageData(config);
    const png = await renderCollagePng(config, analytics, {}, testsTable);

    const white = await countNearWhite(png, 8, 1);
    assert.ok(white < 30, `dark collage must not paint near-white table body, got ${white}`);

    const dark = await countNearColor(png, DARK_SURFACE, 8, 1);
    assert.ok(dark >= 120, `expected dark kit surface pixels in table tile, got ${dark}`);
  });

  it("renderTestsTablePng dark mode paints dark surface in standalone PNG", async () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    const png = renderTestsTablePng(data, { width: 420, height: 280, dark: true });
    const white = await countNearWhite(png, 8, 4);
    assert.ok(white < 5, `standalone dark table must not paint near-white surface, got ${white}`);
  });

  it("profile=default silent-skips testsTable item", async () => {
    const config = parseConfig({
      base: {
        project: "tests-table-skip",
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
          items: [TABLE_ITEM],
        },
      },
    });
    assert.equal(shouldSilentSkipKitOnlyItem("default", TABLE_ITEM), true);

    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const testsTable = await loadTestsTableCollageData(config);
    assert.equal(testsTable, undefined);

    const png = await renderCollagePng(config, analytics, {}, testsTable);
    const green = await countNearColor(png, SUCCESS, 12, 1);
    assert.equal(green, 0, "default profile must not paint testsTable tile");
  });

  it("profile=kit + missing path fails closed", async () => {
    const config = kitConfig({
      testsTablePath: join(fixtures, "missing-tests-table.json"),
    });
    await assert.rejects(
      () => loadTestsTableCollageData(config),
      (err: unknown) => err instanceof TestsTableDataMissingError,
    );
  });

  it("loadTestsTableCollageData fails closed on invalid JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-table-json-"));
    const bad = join(dir, "table.json");
    await writeFile(bad, "{ not json");
    try {
      const config = kitConfig({ testsTablePath: bad });
      await assert.rejects(() => loadTestsTableCollageData(config), /invalid JSON/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("fail-closed when testsTable tile is present but data was not loaded", async () => {
    const config = kitConfig();
    const summary = await readSummary(join(fixtures, "allure3-report/summary.json"));
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    await assert.rejects(
      () => renderCollagePng(config, analytics, {}),
      /tests table data not loaded/,
    );
  });

  it("column tracks are 4:2:2:2 name/status/trend/stability", () => {
    const width = 1008;
    const layout = testsTableColumnLayout(width);
    const inner = width - layout.padX * 2;
    assert.equal(
      layout.nameW + layout.statusW + layout.trendW + layout.stabilityW,
      inner,
    );
    assert.equal(layout.nameW, Math.round((inner * 4) / 10));
    assert.equal(layout.statusW, Math.round((inner * 2) / 10));
    assert.equal(layout.trendW, Math.round((inner * 2) / 10));
    assert.equal(
      layout.stabilityW,
      inner - layout.nameW - layout.statusW - layout.trendW,
    );
  });

  it("optional aHash smoke — standalone panel PNG is stable", () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    const a = renderTestsTablePng(data, { width: 400, height: 260, dark: true });
    const b = renderTestsTablePng(data, { width: 400, height: 260, dark: true });
    assert.equal(aHash16(a), aHash16(b));
  });

  it("flaky badge does not paint into the trend column", async () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    const width = 1000;
    const height = 220;
    const png = renderTestsTablePng(data, { width, height, dark: true });
    const layout = testsTableColumnLayout(width);
    const rowIndex = 1;
    const y = layout.headerH + rowIndex * layout.rowH + Math.floor(layout.rowH / 2);
    const probeW = 6;
    const x = layout.colX.stability - probeW;
    const warning = KIT_DARK_TOKEN_PALETTE["--color-warning"]!;
    const img = await loadImage(png);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data: pixels } = ctx.getImageData(x, y - 4, probeW, 8);
    let warningHits = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (
        Math.abs(pixels[i]! - warning.r) <= 20 &&
        Math.abs(pixels[i + 1]! - warning.g) <= 20 &&
        Math.abs(pixels[i + 2]! - warning.b) <= 20
      ) {
        warningHits += 1;
      }
    }
    assert.equal(
      warningHits,
      0,
      `stability flaky badge leaked ${warningHits} px into the trend column`,
    );
  });
});
