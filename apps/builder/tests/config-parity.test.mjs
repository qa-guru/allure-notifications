/**
 * Stage E bridge: import @allure-notifications/config without rewriting js/app.js (Phase 4).
 * Guards SQ-1080 / canvas / catalog parity with the local browser copy.
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
