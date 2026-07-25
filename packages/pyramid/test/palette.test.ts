import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  CORNER_RATIO,
  LAYER_ORDER,
  PYRAMID_COLORS_DARK,
  PYRAMID_COLORS_LIGHT,
  STATUS_COLORS,
  STATUS_MAPPING,
  TIER_GAP_RATIO,
  colorForLayer,
  isKnownLayer,
  tierCornerRadius,
  tierGapPx,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Walk up from dist/test until monorepo SSOT is found. */
function findSsotPath(): string {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const candidate = join(
      dir,
      "stacks/java-spring/tests/allure/pyramid-layers.json",
    );
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = join(dir, "..");
  }
  throw new Error(
    "SSOT stacks/java-spring/tests/allure/pyramid-layers.json not found " +
      "(run tests inside the zero-design-system checkout)",
  );
}

type Ssot = {
  order: string[];
  status: Record<string, string>;
  statusMapping: Record<string, string>;
  layers: Record<string, { light: string; dark: string }>;
};

function loadSsot(): Ssot {
  return JSON.parse(readFileSync(findSsotPath(), "utf8")) as Ssot;
}

describe("@allure-notifications/pyramid geometry", () => {
  it("locks CORNER_RATIO / TIER_GAP_RATIO to canon", () => {
    assert.equal(CORNER_RATIO, 0.18);
    assert.equal(TIER_GAP_RATIO, 0.11);
  });

  it("tierGapPx / tierCornerRadius mirror Java clamps", () => {
    assert.equal(tierGapPx(100), 11);
    assert.equal(tierGapPx(1), 2);
    assert.equal(tierCornerRadius(200, 100), 18);
    assert.equal(tierCornerRadius(20, 100), 10);
  });
});

describe("@allure-notifications/pyramid palette vs SSOT", () => {
  it("matches stacks/java-spring/tests/allure/pyramid-layers.json", () => {
    const ssot = loadSsot();

    assert.deepEqual([...LAYER_ORDER], ssot.order);
    assert.deepEqual({ ...STATUS_COLORS }, ssot.status);
    assert.deepEqual({ ...STATUS_MAPPING }, ssot.statusMapping);

    for (const [layer, themed] of Object.entries(ssot.layers)) {
      assert.equal(
        PYRAMID_COLORS_LIGHT[layer as keyof typeof PYRAMID_COLORS_LIGHT],
        themed.light,
        `light ${layer}`,
      );
      assert.equal(
        PYRAMID_COLORS_DARK[layer as keyof typeof PYRAMID_COLORS_DARK],
        themed.dark,
        `dark ${layer}`,
      );
    }
  });

  it("unit equals pie passed #94ca66 in both themes", () => {
    assert.equal(STATUS_COLORS.passed, "#94ca66");
    assert.equal(PYRAMID_COLORS_LIGHT.unit, STATUS_COLORS.passed);
    assert.equal(PYRAMID_COLORS_DARK.unit, STATUS_COLORS.passed);
    assert.equal(colorForLayer("unit", "light"), "#94ca66");
    assert.equal(colorForLayer("unit", "dark"), "#94ca66");
  });

  it("isKnownLayer covers ORDER only", () => {
    assert.equal(isKnownLayer("unit"), true);
    assert.equal(isKnownLayer("OTHER"), false);
    assert.equal(isKnownLayer("other"), false);
  });
});
