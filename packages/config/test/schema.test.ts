import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  CANVAS_PRESETS,
  DEFAULT_CANVAS,
  DEFAULT_CARD_GAP,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_ITEMS,
  DEFAULT_TILE_PAD,
  PANEL_CATALOG,
  createDefaultConfig,
  createSq1080Config,
  parseConfig,
  resolvePanelMeta,
  safeParseConfig,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Compiled at packages/config/dist/test → monorepo root is ../../../.. */
const REPO_ROOT = join(__dirname, "../../../..");
const CONFIG_DIR = join(REPO_ROOT, "config");

function loadJson(name: string): unknown {
  return JSON.parse(readFileSync(join(CONFIG_DIR, name), "utf8"));
}

describe("@allure-notifications/config catalog", () => {
  it("exposes 17 panel catalog slots", () => {
    assert.equal(PANEL_CATALOG.length, 17);
    const ids = new Set(PANEL_CATALOG.map((p) => p.id));
    assert.equal(ids.size, 17);
  });

  it("resolves pie ↔ currentStatus and groupBy variants", () => {
    assert.equal(resolvePanelMeta({ type: "currentStatus" })?.id, "pie");
    assert.equal(
      resolvePanelMeta({
        type: "stabilityDistribution",
        groupBy: "feature",
      })?.id,
      "stabilityByFeature",
    );
    assert.equal(
      resolvePanelMeta({ type: "problemsDistribution", by: "environment" })?.id,
      "problemsDistribution",
    );
  });
});

describe("@allure-notifications/config presets", () => {
  it("has three canvas presets and DEFAULT_ITEMS (4-tile screenshot layout)", () => {
    assert.deepEqual(Object.keys(CANVAS_PRESETS).sort(), [
      "1080x1080",
      "1410x1080",
      "870x1080",
    ]);
    assert.equal(DEFAULT_CANVAS, "870x1080");
    assert.deepEqual([...DEFAULT_ITEMS], [
      { type: "pie", x: 0, y: 0, w: 4, h: 4 },
      { type: "durationDynamics", x: 4, y: 0, w: 6, h: 4 },
      { type: "testingPyramid", x: 0, y: 4, w: 3, h: 3 },
      { type: "durations", x: 3, y: 4, w: 4, h: 3, groupBy: "layer" },
    ]);
    assert.equal(DEFAULT_HEADER_HEIGHT, 22);
    assert.equal(DEFAULT_CARD_GAP, 14);
    assert.equal(DEFAULT_TILE_PAD, 6);
  });

  it("createDefaultConfig is CB-870; createSq1080Config is 1080×1080", () => {
    const def = createDefaultConfig({
      project: "phase1-test",
      telegram: { token: "0:t", chat: "1" },
    });
    const parsed = parseConfig(def);
    assert.equal(parsed.base.chart?.layout, "free");
    assert.equal(parsed.base.chart?.width, 870);
    assert.equal(parsed.base.chart?.height, 1080);
    assert.equal(parsed.base.chart?.headerHeight, 22);
    assert.equal(parsed.base.chart?.cardGap, 14);
    assert.equal(parsed.base.chart?.tilePad, 6);
    assert.equal(parsed.base.chart?.items?.length, 4);
    assert.equal(parsed.telegram?.token, "0:t");

    const sq = parseConfig(createSq1080Config());
    assert.equal(sq.base.chart?.width, 1080);
    assert.equal(sq.base.chart?.height, 1080);
  });

  it("createDefaultConfig(1080x1080) validates", () => {
    const cfg = createDefaultConfig({ canvas: "1080x1080" });
    const parsed = parseConfig(cfg);
    assert.equal(parsed.base.chart?.width, 1080);
    assert.equal(parsed.base.chart?.height, 1080);
  });
});

describe("@allure-notifications/config schema vs repo fixtures", () => {
  it("validates builder-shaped CB-870 default (synthetic export)", () => {
    const exported = createDefaultConfig();
    const result = safeParseConfig(exported);
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
  });

  it("validates config.preview-sq1080.json", () => {
    const data = loadJson("config.preview-sq1080.json");
    const result = safeParseConfig(data);
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
  });

  it("validates config.dogfood-builder-cb870.json", () => {
    const data = loadJson("config.dogfood-builder-cb870.json");
    const result = safeParseConfig(data);
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
  });

  it("validates config-5.0-collage.example.json (legacy panels flat array)", () => {
    const data = loadJson("config-5.0-collage.example.json");
    const result = safeParseConfig(data);
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
  });

  it("rejects free layout without items", () => {
    const bad = {
      base: {
        chart: {
          mode: "collage",
          layout: "free",
          width: 1080,
          height: 1080,
        },
      },
    };
    const result = safeParseConfig(bad);
    assert.equal(result.success, false);
  });

  it("rejects negative chart item coordinates", () => {
    const bad = {
      base: {
        chart: {
          mode: "collage",
          layout: "free",
          width: 1080,
          height: 1080,
          items: [{ type: "pie", x: -1, y: 0, w: 2, h: 2 }],
        },
      },
    };
    const result = safeParseConfig(bad);
    assert.equal(result.success, false);
  });
});
