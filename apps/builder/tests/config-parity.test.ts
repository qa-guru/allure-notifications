/**
 * Phase 4: @allure-notifications/config is the SSOT; browser vendor copy must match.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { declareSuite } from "@allure-notifications/test-meta";

declareSuite({
  feature: "config",
  story: "Config browser parity",
  layer: "component",
  component: "builder",
  severity: "normal",
});

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
import { loadConfigVendorBrowser } from "./vendor-browser.js";

const vendorBrowser = loadConfigVendorBrowser();

const SQ1080_ITEMS = [
  { type: "pie", x: 0, y: 0, w: 4, h: 4 },
  { type: "durationDynamics", x: 4, y: 0, w: 6, h: 4 },
  { type: "testingPyramid", x: 0, y: 4, w: 3, h: 3 },
  { type: "durations", x: 3, y: 4, w: 4, h: 3, groupBy: "layer" },
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

test("createDefaultConfig is jar-shaped free CB-870", () => {
  const cfg = createDefaultConfig();
  assert.equal(cfg.base.chart.layout, "free");
  assert.equal(cfg.base.chart.width, 870);
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
