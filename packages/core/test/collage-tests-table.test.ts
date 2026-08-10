/**
 * Tests-table collage wire: kit profile draw, default silent-skip, missing data fail.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { TESTS_TABLE_TOKEN_PALETTE, renderTestsTablePng } from "../src/collage/panels/testsTable.js";
import {
  TestsTableDataMissingError,
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

  it("optional aHash smoke — standalone panel PNG is stable", () => {
    const raw = JSON.parse(readFileSync(TABLE_FIXTURE, "utf8"));
    const data = parseKitTestsTableData(raw);
    const a = renderTestsTablePng(data, { width: 400, height: 260, dark: true });
    const b = renderTestsTablePng(data, { width: 400, height: 260, dark: true });
    assert.equal(aHash16(a), aHash16(b));
  });
});
