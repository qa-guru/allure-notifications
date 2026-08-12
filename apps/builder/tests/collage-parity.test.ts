/**
 * Kit collage palette/geometry; browser vendor copy must match.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "collage",
  story: "Kit collage browser parity",
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
} from "@qa-guru/allure-report-kit/collage";
import * as collagePkg from "@qa-guru/allure-report-kit/collage";
import { loadKitCollageVendorBrowser } from "./vendor-browser.js";

const vendorBrowser = loadKitCollageVendorBrowser();

test("@qa-guru/allure-report-kit/collage locks CORNER_RATIO / TIER_GAP_RATIO", () => {
  assert.equal(CORNER_RATIO, 0.18);
  assert.equal(TIER_GAP_RATIO, 0.11);
  assert.equal(tierGapPx(100), 11);
  assert.equal(tierCornerRadius(200, 100), 18);
});

test("@qa-guru/allure-report-kit/collage unit = collage passed #94ca66", () => {
  assert.equal(STATUS_COLORS.passed, "#94ca66");
  assert.equal(PYRAMID_COLORS_LIGHT.unit, "#94ca66");
  assert.equal(PYRAMID_COLORS_DARK.unit, "#94ca66");
  assert.equal(colorForLayer("unit", "light"), "#94ca66");
  assert.equal(colorForLayer("unit", "dark"), "#94ca66");
});

test("@qa-guru/allure-report-kit/collage LAYER_ORDER is unit → manual", () => {
  assert.deepEqual([...LAYER_ORDER], [
    "unit",
    "component",
    "integration",
    "api",
    "e2e",
    "manual",
  ]);
});

test("./collage subpath matches package geometry / palette", () => {
  assert.equal(collagePkg.CORNER_RATIO, CORNER_RATIO);
  assert.equal(collagePkg.TIER_GAP_RATIO, TIER_GAP_RATIO);
  assert.deepEqual([...collagePkg.LAYER_ORDER], [...LAYER_ORDER]);
  assert.deepEqual(collagePkg.PYRAMID_COLORS_LIGHT, PYRAMID_COLORS_LIGHT);
  assert.deepEqual(collagePkg.PYRAMID_COLORS_DARK, PYRAMID_COLORS_DARK);
  assert.equal(collagePkg.STATUS_COLORS.passed, STATUS_COLORS.passed);
});

test("vendor/allure-report-kit-collage matches ./collage (stand runtime)", () => {
  assert.equal(vendorBrowser.CORNER_RATIO, collagePkg.CORNER_RATIO);
  assert.equal(vendorBrowser.TIER_GAP_RATIO, collagePkg.TIER_GAP_RATIO);
  assert.deepEqual([...vendorBrowser.LAYER_ORDER], [...collagePkg.LAYER_ORDER]);
  assert.deepEqual(vendorBrowser.PYRAMID_COLORS_LIGHT, collagePkg.PYRAMID_COLORS_LIGHT);
  assert.deepEqual(vendorBrowser.PYRAMID_COLORS_DARK, collagePkg.PYRAMID_COLORS_DARK);
  assert.equal(vendorBrowser.STATUS_COLORS.passed, collagePkg.STATUS_COLORS.passed);
  assert.equal(vendorBrowser.tierGapPx(100), collagePkg.tierGapPx(100));
  assert.equal(
    vendorBrowser.tierCornerRadius(200, 100),
    collagePkg.tierCornerRadius(200, 100),
  );
});
