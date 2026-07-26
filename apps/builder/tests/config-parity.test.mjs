/**
 * Phase 4: @allure-notifications/config is the SSOT; browser vendor copy must match.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  CANVAS_PRESETS,
  DEFAULT_CARD_GAP,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_ITEMS,
  DEFAULT_TILE_PAD,
  PANEL_CATALOG,
  createDefaultConfig,
} from "@allure-notifications/config";
import * as browserPkg from "@allure-notifications/config/browser";
import * as vendorBrowser from "../vendor/allure-notifications-config/browser.js";

const SQ1080_ITEMS = [
  { type: "testingPyramid", x: 0, y: 0, w: 3, h: 3 },
  { type: "pie", x: 3, y: 0, w: 3, h: 3 },
  { type: "durations", x: 6, y: 0, w: 4, h: 3 },
  { type: "coverageDiff", x: 0, y: 3, w: 3, h: 3 },
  { type: "successRateDistribution", x: 3, y: 3, w: 3, h: 3 },
  { type: "problemsDistribution", x: 6, y: 3, w: 4, h: 3, by: "environment" },
  {
    type: "stabilityDistribution",
    x: 6,
    y: 6,
    w: 4,
    h: 4,
    groupBy: "feature",
  },
];

test("@allure-notifications/config DEFAULT_ITEMS matches SQ-1080 canon", () => {
  assert.deepEqual([...DEFAULT_ITEMS], SQ1080_ITEMS);
});

test("@allure-notifications/config CANVAS_PRESETS are CB-870 / SQ-1080 / WD-1410", () => {
  assert.deepEqual(Object.keys(CANVAS_PRESETS), [
    "870x1080",
    "1080x1080",
    "1410x1080",
  ]);
  assert.deepEqual(CANVAS_PRESETS["870x1080"], { w: 870, h: 1080 });
  assert.deepEqual(CANVAS_PRESETS["1080x1080"], { w: 1080, h: 1080 });
  assert.deepEqual(CANVAS_PRESETS["1410x1080"], { w: 1410, h: 1080 });
});

test("@allure-notifications/config chrome defaults + PANEL_CATALOG size", () => {
  assert.equal(DEFAULT_HEADER_HEIGHT, 22);
  assert.equal(DEFAULT_CARD_GAP, 14);
  assert.equal(DEFAULT_TILE_PAD, 6);
  assert.equal(PANEL_CATALOG.length, 17);
});

test("createDefaultConfig is jar-shaped free SQ-1080", () => {
  const cfg = createDefaultConfig();
  assert.equal(cfg.base.chart.layout, "free");
  assert.equal(cfg.base.chart.width, 1080);
  assert.equal(cfg.base.chart.height, 1080);
  assert.deepEqual(cfg.base.chart.items, SQ1080_ITEMS);
  assert.ok(cfg.telegram);
});

test("./browser subpath matches package catalog / presets", () => {
  assert.deepEqual([...browserPkg.DEFAULT_ITEMS], [...DEFAULT_ITEMS]);
  assert.deepEqual(browserPkg.CANVAS_PRESETS, CANVAS_PRESETS);
  assert.equal(browserPkg.PANEL_CATALOG.length, PANEL_CATALOG.length);
  assert.deepEqual(browserPkg.createDefaultConfig().base.chart.items, SQ1080_ITEMS);
});

test("vendor/allure-notifications-config matches ./browser (stand runtime)", () => {
  assert.deepEqual([...vendorBrowser.DEFAULT_ITEMS], [...browserPkg.DEFAULT_ITEMS]);
  assert.deepEqual(vendorBrowser.CANVAS_PRESETS, browserPkg.CANVAS_PRESETS);
  assert.equal(vendorBrowser.PANEL_CATALOG.length, browserPkg.PANEL_CATALOG.length);
  assert.deepEqual(
    vendorBrowser.createDefaultConfig().base.chart,
    browserPkg.createDefaultConfig().base.chart,
  );
});
