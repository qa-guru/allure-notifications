import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

import * as config from "../src/index.js";
import { suggestLayout, type ChartItem, type SuggestedLayout as Layout, type SuggestSignals as Signals } from "../src/index.js";

declareSuite({
  feature: "config",
  story: "Deterministic collage suggestions",
  layer: "unit",
  component: "@qa-guru/allure-notifications-config",
  severity: "critical",
});

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../../../../config");
const hero = config.parseConfig(JSON.parse(readFileSync(join(fixtures, "config.dogfood-telegram-full.json"), "utf8"))).base.chart!;

function signals(overrides: Partial<Signals> = {}): Signals {
  return {
    statistic: { passed: 10, failed: 0, broken: 0, skipped: 0, unknown: 0, total: 10 },
    durationMs: 1000,
    layers: {},
    hasLayerLabels: false,
    hasKnownLayerLabels: false,
    knownLayerCount: 0,
    severities: {},
    suites: [],
    durationsMsByLayer: {},
    historyRunCount: 0,
    qualityGateRuleCount: 0,
    ...overrides,
  };
}

function ids(layout: Layout): string[] {
  return layout.items.map((item) => config.resolvePanelMeta(item)!.id);
}

function geometry(items: readonly ChartItem[]) {
  return items.map(({ x, y, w, h }) => ({ x, y, w, h }));
}

const layered = {
  layers: { unit: 8, e2e: 2 },
  hasLayerLabels: true,
  hasKnownLayerLabels: true,
  knownLayerCount: 2,
};

describe("suggestLayout", () => {
  it("returns honest DEFAULT_ITEMS when signals are insufficient", () => {
    for (const historyRunCount of [0, 1]) {
      const layout = suggestLayout(signals({ historyRunCount }));
      assert.equal(layout.profile, "default");
      assert.deepEqual(layout.canvas, config.CANVAS_PRESETS["870x1080"]);
      assert.deepEqual(layout.items, config.DEFAULT_ITEMS);
      assert.deepEqual(Object.keys(layout).sort(), ["canvas", "items", "profile"]);
    }
  });

  it("selects the six-slot SQ-1080 template for usable history without layers", () => {
    const layout = suggestLayout(signals({ historyRunCount: 2 }));
    assert.deepEqual(layout.canvas, config.CANVAS_PRESETS["1080x1080"]);
    assert.equal(layout.items.length, 6);
    assert.deepEqual(new Set(ids(layout)), new Set([
      "currentStatus", "durationDynamics", "statusDynamics", "statusTransitions",
      "successRateDistribution", "testBaseGrowthDynamics",
    ]));
    assert.deepEqual(geometry(layout.items), geometry(hero.items!.slice(0, 6)));
  });

  it("keeps the CB-870 readme hero as a golden when history and known layers fit", () => {
    const layout = suggestLayout(signals({ ...layered, historyRunCount: 20 }));
    assert.deepEqual(layout.canvas, config.CANVAS_PRESETS["870x1080"]);
    assert.deepEqual(layout.items, hero.items);
  });

  it("does not treat unknown or a single known layer as a multi-layer pyramid", () => {
    for (const knownLayerCount of [0, 1]) {
      const layout = suggestLayout(signals({
        ...layered,
        layers: { unit: 8, custom: 2 },
        knownLayerCount,
        historyRunCount: 2,
      }));
      assert.equal(ids(layout).includes("durationsByLayer"), false);
    }
  });

  it("requires known labels and keeps layer pairs ahead of secondary kit panels", () => {
    const unknown = suggestLayout(signals({ ...layered, hasKnownLayerLabels: false, historyRunCount: 2 }));
    assert.equal(ids(unknown).includes("testingPyramid"), false);
    const table = suggestLayout(signals({
      ...layered,
      historyRunCount: 2,
      testsTablePath: "/fixtures/table.json",
      statistic: { passed: 9, failed: 1, broken: 0, skipped: 0, unknown: 0, total: 10 },
    }));
    assert.deepEqual(table.canvas, config.CANVAS_PRESETS["1410x1080"]);
    assert.ok(ids(table).includes("testingPyramid") && ids(table).includes("durationsByLayer"));
    assert.ok(ids(table).includes("testsTable"));
  });

  it("keeps layer and severity signals from manufacturing filler panels", () => {
    const layout = suggestLayout(signals({ ...layered, severities: { blocker: 3, minor: 7 } }));
    assert.deepEqual(layout.items, config.DEFAULT_ITEMS);
  });

  it("recommends problemsDistribution for failed or broken default runs", () => {
    for (const [failed, broken] of [[1, 0], [0, 1]]) {
      const layout = suggestLayout(signals({
        statistic: { passed: 9, failed: failed!, broken: broken!, skipped: 0, unknown: 0, total: 10 },
      }));
      assert.equal(layout.profile, "default");
      assert.ok(ids(layout).includes("problemsDistribution"));
      assert.equal(layout.items.find((item) => item.type === "problemsDistribution")?.by, "environment");
    }
  });

  it("uses testsTable only for failures with a payload and a kit profile", () => {
    const failed = signals({ statistic: { passed: 9, failed: 1, broken: 0, skipped: 0, unknown: 0, total: 10 } });
    const withTable = suggestLayout({ ...failed, testsTablePath: "/fixtures/testsTable.json" });
    assert.equal(withTable.profile, "kit");
    assert.ok(ids(withTable).includes("testsTable"));

    const stock = suggestLayout({ ...failed, testsTablePath: "/fixtures/testsTable.json", profile: "default" });
    assert.ok(ids(stock).includes("problemsDistribution"));
    assert.equal(stock.items.some(config.isKitOnlyChartItem), false);

    const noPayload = suggestLayout({ ...failed, profile: "kit" });
    assert.ok(ids(noPayload).includes("problemsDistribution"));
    assert.equal(ids(noPayload).includes("testsTable"), false);

    const passed = suggestLayout(signals({ testsTablePath: "/fixtures/testsTable.json" }));
    assert.equal(passed.profile, "default");
    assert.equal(ids(passed).includes("testsTable"), false);
  });

  it("selects distinct kit QG catalog ids from rules or payload paths", () => {
    for (const fact of [{ qualityGateRuleCount: 1 }, { allureQualityGatePath: "/fixtures/aqg.json" }]) {
      const layout = suggestLayout(signals(fact));
      assert.equal(layout.profile, "kit");
      assert.ok(ids(layout).includes("allureQualityGate"));
      assert.equal(layout.items.find((item) => item.type === "qualityGate")?.id, "allureQualityGate");
    }
    const sonar = suggestLayout(signals({ sonarQualityGatePath: "/fixtures/sonar.json" }));
    assert.ok(ids(sonar).includes("sonarQualityGate"));
    assert.equal(ids(sonar).includes("allureQualityGate"), false);
    const both = suggestLayout(signals({ qualityGateRuleCount: 1, sonarQualityGatePath: "/fixtures/sonar.json" }));
    assert.ok(ids(both).includes("allureQualityGate") && ids(both).includes("sonarQualityGate"));
  });

  it("exposes a browser-safe pure suggest entry without builder wiring", async () => {
    const entryPoint = "@qa-guru/allure-notifications-config/suggest";
    const entry = await import(entryPoint);
    assert.equal(entry.suggestLayout, suggestLayout);
    assert.equal(entry.SUGGEST_TEMPLATES.default.items.length, 4);
    assert.equal(entry.SUGGEST_TEMPLATES.trends.items.length, 6);
    assert.equal(entry.SUGGEST_TEMPLATES.hero.items.length, 7);
    assert.equal(entry.SUGGEST_TEMPLATES.detail.items.length, 7);
    assert.ok(Object.isFrozen(entry.SUGGEST_TEMPLATES.hero.items[0]));
  });

  it("honours explicit default or kit without fabricating kit payloads", () => {
    const stock = suggestLayout(signals({ profile: "default", qualityGateRuleCount: 2, sonarQualityGatePath: "/fixtures/sonar.json" }));
    assert.equal(stock.profile, "default");
    assert.equal(stock.items.some(config.isKitOnlyChartItem), false);
    const kit = suggestLayout(signals({ profile: "kit" }));
    assert.equal(kit.profile, "kit");
    assert.deepEqual(kit.items, config.DEFAULT_ITEMS);
  });

  it("uses WD-1410 fixed hero slots for a crowded kit run and keeps ready kit panels", () => {
    const layout = suggestLayout(signals({
      ...layered,
      historyRunCount: 20,
      qualityGateRuleCount: 1,
      allureQualityGatePath: "/fixtures/aqg.json",
      sonarQualityGatePath: "/fixtures/sonar.json",
      testsTablePath: "/fixtures/table.json",
      statistic: { passed: 8, failed: 1, broken: 1, skipped: 0, unknown: 0, total: 10 },
    }));
    assert.deepEqual(layout.canvas, config.CANVAS_PRESETS["1410x1080"]);
    assert.equal(layout.items.length, 7);
    for (const id of ["currentStatus", "durationDynamics", "statusDynamics", "testingPyramid", "durationsByLayer", "allureQualityGate", "testsTable"]) {
      assert.ok(ids(layout).includes(id), id);
    }
    assert.equal(ids(layout).includes("sonarQualityGate"), false);
    assert.deepEqual(geometry(layout.items), geometry(hero.items!));
  });

  it("is deterministic, validates with the send parser and never overlaps or changes the catalog", () => {
    const catalogBefore = JSON.stringify(config.PANEL_CATALOG);
    for (const historyRunCount of [0, 1, 2]) {
      for (const profile of [undefined, "default", "kit"] as const) {
        for (const qualityGateRuleCount of [0, 1]) {
          const input = signals({ ...layered, historyRunCount, profile, qualityGateRuleCount });
          const before = JSON.stringify(input);
          const layout = suggestLayout(input);
          assert.deepEqual(suggestLayout(input), layout);
          assert.equal(JSON.stringify(input), before);
          assert.equal(layout.items[0]?.type, "currentStatus");
          assert.ok(layout.items.every((item) => config.resolvePanelMeta(item)));
          config.parseConfig({ base: { chart: { profile: layout.profile, layout: "free", items: layout.items, width: layout.canvas.w, height: layout.canvas.h } } });
          for (const item of layout.items) {
            assert.ok(item.x + item.w <= config.GRID_COLS && item.y + item.h <= config.GRID_ROWS);
            for (const other of layout.items) {
              if (item !== other) {
                assert.ok(item.x + item.w <= other.x || other.x + other.w <= item.x || item.y + item.h <= other.y || other.y + other.h <= item.y);
              }
            }
          }
        }
      }
    }
    assert.equal(JSON.stringify(config.PANEL_CATALOG), catalogBefore);
  });

  it("returns independent canvas and item objects", () => {
    const first = suggestLayout(signals());
    first.canvas.w = 1;
    first.items[0]!.w = 1;
    assert.deepEqual(suggestLayout(signals()).items, config.DEFAULT_ITEMS);
    assert.deepEqual(suggestLayout(signals()).canvas, config.CANVAS_PRESETS["870x1080"]);
  });
});
