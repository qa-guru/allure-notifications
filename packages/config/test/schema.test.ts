import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "config",
  story: "Config schema and catalog",
  layer: "unit",
  component: "@qa-guru/allure-notifications-config",
  severity: "normal",
});

import {
  CANVAS_PRESETS,
  CHART_PROFILE_DEFAULT,
  DEFAULT_CANVAS,
  DEFAULT_CARD_GAP,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_ITEMS,
  DEFAULT_TILE_PAD,
  KIT_ONLY_PANEL_IDS,
  KIT_ONLY_PANEL_KIND,
  PANEL_CATALOG,
  createDefaultConfig,
  createSq1080Config,
  isKitOnlyChartItem,
  isValidConfig,
  normalizeChartProfile,
  parseConfig,
  resolvePanelMeta,
  safeParseConfig,
  shouldSilentSkipKitOnlyItem,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Compiled at packages/config/dist/test → monorepo root is ../../../.. */
const REPO_ROOT = join(__dirname, "../../../..");
const CONFIG_DIR = join(REPO_ROOT, "config");

function loadJson(name: string): unknown {
  return JSON.parse(readFileSync(join(CONFIG_DIR, name), "utf8"));
}

describe("@qa-guru/allure-notifications-config catalog", () => {
  it("exposes 19 panel catalog slots (17 analytics + 2 quality gates)", () => {
    assert.equal(PANEL_CATALOG.length, 19);
    const ids = new Set(PANEL_CATALOG.map((p) => p.id));
    assert.equal(ids.size, 19);
  });

  it("includes kit quality-gate ids with stable type qualityGate", () => {
    assert.equal(resolvePanelMeta({ id: "allureQualityGate" })?.type, "qualityGate");
    assert.equal(resolvePanelMeta({ id: "sonarQualityGate" })?.type, "qualityGate");
    assert.equal(resolvePanelMeta({ type: "qualityGate", id: "allureQualityGate" })?.id, "allureQualityGate");
  });

  it("resolves currentStatus and groupBy variants", () => {
    assert.equal(resolvePanelMeta({ type: "currentStatus" })?.id, "currentStatus");
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
    assert.equal(resolvePanelMeta({ id: "currentStatus" })?.type, "currentStatus");
    assert.equal(resolvePanelMeta({ id: "missing-id", type: "currentStatus" })?.id, "currentStatus");
    // Unknown groupBy on a type that also has a bare row → fall through to bare.
    assert.equal(
      resolvePanelMeta({ type: "durations", groupBy: "not-a-real-group" })?.id,
      "durations",
    );
    // Unknown groupBy when every catalog row for the type has groupBy → undefined.
    assert.equal(
      resolvePanelMeta({
        type: "stabilityDistribution",
        groupBy: "not-a-real-group",
      }),
      undefined,
    );
    // Type with `by` only: wrong by skips exact and bare-find (`!p.by` false).
    assert.equal(
      resolvePanelMeta({ type: "problemsDistribution", by: "host" }),
      undefined,
    );
    assert.equal(resolvePanelMeta({}), undefined);
  });
});

describe("@qa-guru/allure-notifications-config presets", () => {
  it("has three canvas presets and DEFAULT_ITEMS (4-tile screenshot layout)", () => {
    assert.deepEqual(Object.keys(CANVAS_PRESETS).sort(), [
      "1080x1080",
      "1410x1080",
      "870x1080",
    ]);
    assert.equal(DEFAULT_CANVAS, "870x1080");
    assert.deepEqual([...DEFAULT_ITEMS], [
      { type: "currentStatus", x: 0, y: 0, w: 4, h: 4 },
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

  it("createDefaultConfig rejects unknown canvas preset", () => {
    assert.throws(
      () => createDefaultConfig({ canvas: "999x999" as "870x1080" }),
      /Unknown canvas preset/,
    );
  });
});

describe("@qa-guru/allure-notifications-config schema vs repo fixtures", () => {
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

  it("validates config.dogfood-telegram-full.json (readme-hero 7-tile)", () => {
    const data = loadJson("config.dogfood-telegram-full.json") as {
      base: { chart: { items: unknown[] } };
    };
    const result = safeParseConfig(data);
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
    assert.equal(data.base.chart.items.length, 7);
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
          items: [{ type: "currentStatus", x: -1, y: 0, w: 2, h: 2 }],
        },
      },
    };
    const result = safeParseConfig(bad);
    assert.equal(result.success, false);
  });

  it("isValidConfig narrows valid config and rejects invalid", () => {
    const valid = createDefaultConfig();
    assert.equal(isValidConfig(valid), true);
    if (isValidConfig(valid)) {
      assert.equal(valid.base.chart?.width, 870);
    }

    assert.equal(isValidConfig({ base: { project: 123 } }), false);
  });

  it('accepts base.language "de"', () => {
    const result = safeParseConfig({
      base: { language: "de", chart: { layout: "free", width: 870, height: 1080, items: [{ type: "currentStatus", x: 0, y: 0, w: 2, h: 2 }] } },
    });
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
    if (result.success) {
      assert.equal(result.data.base.language, "de");
    }
  });

  it('accepts base.language "morse"', () => {
    const result = safeParseConfig({
      base: { language: "morse", chart: { layout: "free", width: 870, height: 1080, items: [{ type: "currentStatus", x: 0, y: 0, w: 2, h: 2 }] } },
    });
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
    if (result.success) {
      assert.equal(result.data.base.language, "morse");
    }
  });
});

describe("@qa-guru/allure-notifications-config chart.profile + kit-only QG", () => {
  const qgItems = [
    { id: "allureQualityGate", type: "qualityGate", x: 0, y: 0, w: 6, h: 3 },
    { id: "sonarQualityGate", type: "qualityGate", x: 6, y: 0, w: 6, h: 3 },
  ];

  it("defaults chart.profile to default when omitted", () => {
    const parsed = parseConfig({
      base: {
        chart: {
          layout: "free",
          width: 870,
          height: 1080,
          items: [{ type: "currentStatus", x: 0, y: 0, w: 2, h: 2 }],
        },
      },
    });
    assert.equal(parsed.base.chart?.profile, "default");
    assert.equal(CHART_PROFILE_DEFAULT, "default");
    assert.equal(normalizeChartProfile(undefined), "default");
  });

  it("accepts profile kit and rejects unknown profile values", () => {
    const kit = safeParseConfig({
      base: {
        chart: {
          profile: "kit",
          layout: "free",
          width: 870,
          height: 1080,
          items: qgItems,
        },
      },
    });
    assert.equal(kit.success, true, kit.success ? "" : JSON.stringify(kit.error.format()));
    if (kit.success) {
      assert.equal(kit.data.base.chart?.profile, "kit");
    }

    const bad = safeParseConfig({
      base: {
        chart: {
          profile: "auto",
          layout: "free",
          width: 870,
          height: 1080,
          items: [{ type: "currentStatus", x: 0, y: 0, w: 2, h: 2 }],
        },
      },
    });
    assert.equal(bad.success, false);
  });

  it("parses qualityGate items under profile=default (no parse fail)", () => {
    const result = safeParseConfig({
      base: {
        chart: {
          profile: "default",
          layout: "free",
          width: 870,
          height: 1080,
          items: qgItems,
        },
      },
    });
    assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error.format()));
    if (result.success) {
      assert.equal(result.data.base.chart?.items?.length, 2);
      assert.equal(result.data.base.chart?.profile, "default");
    }
  });

  it("exports kit-only kind/id set for T6 silent-skip", () => {
    assert.equal(KIT_ONLY_PANEL_KIND, "qualityGate");
    assert.deepEqual([...KIT_ONLY_PANEL_IDS], ["allureQualityGate", "sonarQualityGate"]);
    assert.equal(isKitOnlyChartItem({ type: "qualityGate" }), true);
    assert.equal(isKitOnlyChartItem({ id: "sonarQualityGate", type: "qualityGate" }), true);
    assert.equal(isKitOnlyChartItem({ type: "currentStatus" }), false);
    assert.equal(
      shouldSilentSkipKitOnlyItem("default", { type: "qualityGate", id: "allureQualityGate" }),
      true,
    );
    assert.equal(
      shouldSilentSkipKitOnlyItem("kit", { type: "qualityGate", id: "allureQualityGate" }),
      false,
    );
    assert.equal(shouldSilentSkipKitOnlyItem("default", { type: "currentStatus" }), false);
  });
});
