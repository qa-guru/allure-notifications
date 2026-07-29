/**
 * Phase 4 optional: @allure-notifications/pyramid is the geometry/palette SSOT;
 * browser vendor copy must match.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { declareSuite } from "@allure-notifications/test-meta";

declareSuite({
  feature: "pyramid",
  story: "Pyramid browser parity",
  layer: "component",
  component: "builder",
  severity: "normal",
});

import {
  CORNER_RATIO,
  LAYER_ORDER,
  PYRAMID_COLORS_DARK,
  PYRAMID_COLORS_LIGHT,
  STATUS_COLORS,
  TIER_GAP_RATIO,
  colorForLayer,
  tierCornerRadius,
  tierGapPx,
} from "@allure-notifications/pyramid";
import * as browserPkg from "@allure-notifications/pyramid/browser";
import * as vendorBrowser from "../vendor/allure-notifications-pyramid/browser.js";

test("@allure-notifications/pyramid locks CORNER_RATIO / TIER_GAP_RATIO", () => {
  assert.equal(CORNER_RATIO, 0.18);
  assert.equal(TIER_GAP_RATIO, 0.11);
  assert.equal(tierGapPx(100), 11);
  assert.equal(tierCornerRadius(200, 100), 18);
});

test("@allure-notifications/pyramid unit = pie passed #94ca66", () => {
  assert.equal(STATUS_COLORS.passed, "#94ca66");
  assert.equal(PYRAMID_COLORS_LIGHT.unit, "#94ca66");
  assert.equal(PYRAMID_COLORS_DARK.unit, "#94ca66");
  assert.equal(colorForLayer("unit", "light"), "#94ca66");
  assert.equal(colorForLayer("unit", "dark"), "#94ca66");
});

test("@allure-notifications/pyramid LAYER_ORDER is unit → manual", () => {
  assert.deepEqual([...LAYER_ORDER], [
    "unit",
    "component",
    "integration",
    "api",
    "e2e",
    "manual",
  ]);
});

test("./browser subpath matches package geometry / palette", () => {
  assert.equal(browserPkg.CORNER_RATIO, CORNER_RATIO);
  assert.equal(browserPkg.TIER_GAP_RATIO, TIER_GAP_RATIO);
  assert.deepEqual([...browserPkg.LAYER_ORDER], [...LAYER_ORDER]);
  assert.deepEqual(browserPkg.PYRAMID_COLORS_LIGHT, PYRAMID_COLORS_LIGHT);
  assert.deepEqual(browserPkg.PYRAMID_COLORS_DARK, PYRAMID_COLORS_DARK);
  assert.equal(browserPkg.STATUS_COLORS.passed, STATUS_COLORS.passed);
});

test("vendor/allure-notifications-pyramid matches ./browser (stand runtime)", () => {
  assert.equal(vendorBrowser.CORNER_RATIO, browserPkg.CORNER_RATIO);
  assert.equal(vendorBrowser.TIER_GAP_RATIO, browserPkg.TIER_GAP_RATIO);
  assert.deepEqual([...vendorBrowser.LAYER_ORDER], [...browserPkg.LAYER_ORDER]);
  assert.deepEqual(vendorBrowser.PYRAMID_COLORS_LIGHT, browserPkg.PYRAMID_COLORS_LIGHT);
  assert.deepEqual(vendorBrowser.PYRAMID_COLORS_DARK, browserPkg.PYRAMID_COLORS_DARK);
  assert.equal(vendorBrowser.STATUS_COLORS.passed, browserPkg.STATUS_COLORS.passed);
  assert.equal(vendorBrowser.tierGapPx(100), browserPkg.tierGapPx(100));
  assert.equal(
    vendorBrowser.tierCornerRadius(200, 100),
    browserPkg.tierCornerRadius(200, 100),
  );
});
