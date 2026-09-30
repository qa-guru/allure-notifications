import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

import * as core from "../src/index.js";
import * as config from "@qa-guru/allure-notifications-config";
import { suggestLayout, type ChartItem } from "@qa-guru/allure-notifications-config";
import { buildSuggestSignals, loadSuggestSignals } from "../src/index.js";

declareSuite({
  feature: "core-collage",
  story: "Compact suggest signals and dogfood",
  layer: "unit",
  component: "@qa-guru/allure-notifications-core",
  severity: "critical",
});

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures");
const repoRoot = resolve(fixtures, "../../../..");
const dogfoodResults = join(fixtures, "dogfood-results");

async function dogfoodAnalytics() {
  const summary = await core.readSummary(join(fixtures, "dogfood-report/summary.json"));
  const results = await core.readAllureResults(dogfoodResults);
  const history = core.historyFromRuns(await core.readHistoryFile(join(fixtures, "history-dogfood-full.jsonl")));
  return core.buildAnalytics(summary, results, core.DEFAULT_TOP_SUITES, history);
}

describe("suggest signals", () => {
  it("condenses dogfood analytics without raw cases, labels or duration samples", async () => {
    const analytics = await dogfoodAnalytics();
    const before = JSON.stringify(analytics);
    const signals = buildSuggestSignals(analytics);
    assert.deepEqual(signals.statistic, { passed: 30, failed: 2, broken: 1, skipped: 1, unknown: 0, total: 34 });
    assert.ok(signals.knownLayerCount >= 2);
    assert.equal(signals.historyRunCount, 12);
    assert.equal(signals.durationsMsByLayer.component?.count, 8);
    assert.ok(signals.durationsMsByLayer.component!.meanMs > 0);
    assert.equal("stabilityCases" in signals, false);
    assert.equal("durationsMs" in signals, false);
    assert.equal(JSON.stringify(analytics), before);
  });

  it("pins scorer geometry to the real CB-870 dogfood golden and recommends its failures", async () => {
    const signals = buildSuggestSignals(await dogfoodAnalytics());
    const layout = suggestLayout(signals);
    const golden = config.parseConfig(JSON.parse(await readFile(join(repoRoot, "config/config.dogfood-telegram-full.json"), "utf8")));
    const geometry = (items: readonly ChartItem[]) => items.map(({ x, y, w, h }) => ({ x, y, w, h }));
    assert.deepEqual(layout.canvas, { w: golden.base.chart!.width, h: golden.base.chart!.height });
    assert.deepEqual(geometry(layout.items), geometry(golden.base.chart!.items!));
    assert.ok(layout.items.some((item) => item.type === "testingPyramid"));
    assert.ok(layout.items.some((item) => item.type === "durations" && item.groupBy === "layer"));
    assert.ok(layout.items.some((item) => item.type === "problemsDistribution"));
  });

  it("counts rules but not arbitrary qualityGate blocks or unknown layers", () => {
    const analytics = core.buildAnalytics(core.adaptSummaryJson(null), [
      { labels: [{ name: "layer", value: "unit" }] },
      { labels: [{ name: "layer", value: "custom" }] },
    ]);
    analytics.durationsMsByLayer.empty = [];
    for (const qualityGate of [null, {}, { rules: "not-an-array" }, { rules: [] }]) {
      const signals = buildSuggestSignals(analytics, config.parseConfig({ base: {}, qualityGate }));
      assert.equal(signals.qualityGateRuleCount, 0);
      assert.equal(signals.knownLayerCount, 1);
      assert.deepEqual(signals.durationsMsByLayer.empty, { count: 0, meanMs: 0 });
    }
    const signals = buildSuggestSignals(analytics, config.parseConfig({ base: {}, qualityGate: { rules: [{ maxFailures: 0 }] } }));
    assert.equal(signals.qualityGateRuleCount, 1);
  });

  it("reads raw dogfood results without requiring a generated report or ambient history", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-raw-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const results = join(dir, "allure-results");
    await cp(dogfoodResults, results, { recursive: true });
    const signals = await loadSuggestSignals(results);
    assert.deepEqual(signals.statistic, { passed: 30, failed: 2, broken: 1, skipped: 1, unknown: 0, total: 34 });
    assert.equal(signals.historyRunCount, 0);
    assert.equal(signals.historyPath, undefined);
    assert.ok(signals.hasKnownLayerLabels);
  });

  it("discovers neighbouring history and kit payloads and emits absolute paths", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-neighbours-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const results = join(dir, "allure-results");
    await cp(dogfoodResults, results, { recursive: true });
    await cp(join(fixtures, "history-dogfood-full.jsonl"), join(dir, "history.jsonl"));
    await cp(join(fixtures, "quality-gate/aqg-passed.json"), join(results, "allureQualityGate.json"));
    await cp(join(fixtures, "sonar/project-status-passed.json"), join(dir, "sonarQualityGate.json"));
    await cp(join(fixtures, "tests-table/tests-table-panel.json"), join(results, "testsTable.json"));
    const signals = await loadSuggestSignals(results);
    assert.equal(signals.historyRunCount, 12);
    assert.equal(signals.historyPath, join(dir, "history.jsonl"));
    assert.equal(signals.allureQualityGatePath, join(results, "allureQualityGate.json"));
    assert.equal(signals.sonarQualityGatePath, join(dir, "sonarQualityGate.json"));
    assert.equal(signals.testsTablePath, join(results, "testsTable.json"));
  });

  it("honours configured summary, history limit and data paths", async () => {
    const input = config.parseConfig({ base: {
      allureFolder: join(fixtures, "dogfood-report"),
      chart: {
        historyPath: join(fixtures, "history-dogfood-full.jsonl"), historyLimit: 1,
        allureQualityGatePath: join(fixtures, "quality-gate/aqg-passed.json"),
        sonarQualityGatePath: join(fixtures, "sonar/project-status-passed.json"),
        testsTablePath: join(fixtures, "tests-table/tests-table-panel.json"),
      },
    } });
    const signals = await loadSuggestSignals(dogfoodResults, input);
    assert.equal(signals.statistic.total, 34);
    assert.equal(signals.historyRunCount, 1);
    assert.equal(signals.allureFolder, input.base.allureFolder);
    assert.equal(signals.testsTablePath, input.base.chart?.testsTablePath);
  });

  it("uses result-local summary.json and skips malformed or empty history records", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-summary-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await writeFile(join(dir, "summary.json"), JSON.stringify({ stats: { total: 42, passed: 42 }, duration: 1000 }));
    await writeFile(join(dir, "history.jsonl"), 'invalid\n{}\n[]\n{"testResults":{}}\n{"testResults":{"a":{"status":"passed"}}}\n');
    const signals = await loadSuggestSignals(dir);
    assert.equal(signals.statistic.total, 42);
    assert.equal(signals.historyRunCount, 1);
    assert.equal(signals.allureFolder, dir);
  });

  it("filters unusable history records before applying the run limit", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-history-limit-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const valid = [
      { timestamp: 1, testResults: { a: { status: "failed" } } },
      { timestamp: 2, testResults: { a: { status: "passed" } } },
    ];
    await writeFile(join(dir, "history.jsonl"), [...valid, ...Array.from({ length: 25 }, () => ({ timestamp: 3 }))].map((run) => JSON.stringify(run)).join("\n"));
    const signals = await loadSuggestSignals(dir, config.parseConfig({ base: { chart: { historyLimit: 2 } } }));
    assert.equal(signals.historyRunCount, 2);
    assert.equal(suggestLayout(signals).items.length, 6);
  });

  it("derives normalized status counters and wall duration without reading attachments", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-statuses-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const cases = [
      { status: " PASSED ", start: 100, stop: 500 },
      { status: "unexpected", start: 500, stop: 490 },
      { stop: 0 },
      { start: 10 },
    ];
    for (const [index, result] of cases.entries()) {
      await writeFile(join(dir, `${index}-result.json`), JSON.stringify(result));
    }
    await writeFile(join(dir, "attachment.json"), "not JSON");
    const signals = await loadSuggestSignals(dir);
    assert.deepEqual(signals.statistic, { passed: 1, failed: 0, broken: 0, skipped: 0, unknown: 3, total: 4 });
    assert.equal(signals.durationMs, 400);
    assert.equal(signals.hasLayerLabels, false);
    assert.equal(signals.knownLayerCount, 0);
  });

  it("falls back honestly for an empty results directory and blank optional facts", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-empty-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const input = config.parseConfig({ base: { allureFolder: " ", chart: {
      historyPath: " ", allureQualityGatePath: " ", sonarQualityGatePath: " ", testsTablePath: " ",
    } } });
    const signals = await loadSuggestSignals(dir, input);
    assert.equal(signals.statistic.total, 0);
    assert.equal(signals.durationMs, 0);
    assert.equal(signals.historyRunCount, 0);
    assert.deepEqual(suggestLayout(signals).items, config.DEFAULT_ITEMS);
    const compact = buildSuggestSignals(core.buildAnalytics(core.adaptSummaryJson(null), []), input);
    assert.equal(compact.allureFolder, undefined);
    assert.equal(compact.historyPath, undefined);
    assert.equal(compact.testsTablePath, undefined);
  });

  it("ignores non-files and ENOTDIR candidates but propagates other filesystem errors", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-fs-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await mkdir(join(dir, "summary.json"));
    await writeFile(join(dir, "not-a-report"), "file");
    const signals = await loadSuggestSignals(dir, config.parseConfig({ base: { allureFolder: join(dir, "not-a-report") } }));
    assert.equal(signals.statistic.total, 0);
    await assert.rejects(
      () => loadSuggestSignals(dir, config.parseConfig({ base: { allureFolder: join(dir, "x".repeat(300)) } })),
      /ENAMETOOLONG/,
    );
  });

  it("does not silently replace a malformed summary with raw counters", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-bad-summary-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await writeFile(join(dir, "summary.json"), "invalid");
    await assert.rejects(() => loadSuggestSignals(dir), SyntaxError);
  });

  it("supports report widget paths and A2-shaped summaries without changing send", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-widgets-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const results = join(dir, "allure-results");
    const report = join(dir, "allure-report");
    const widgets = join(report, "widgets/kit-panels");
    await mkdir(results);
    await mkdir(widgets, { recursive: true });
    await writeFile(join(report, "widgets/summary.json"), JSON.stringify({ statistic: { passed: 2, total: 2 }, time: { duration: 7 } }));
    await cp(join(fixtures, "quality-gate/aqg-passed.json"), join(widgets, "allureQualityGate.json"));
    await cp(join(fixtures, "tests-table/tests-table-panel.json"), join(widgets, "testsTable.json"));
    const signals = await loadSuggestSignals(results);
    assert.equal(signals.statistic.passed, 2);
    assert.equal(signals.allureFolder, report);
    assert.equal(signals.allureQualityGatePath, join(widgets, "allureQualityGate.json"));
    assert.equal(signals.testsTablePath, join(widgets, "testsTable.json"));
  });

  it("rejects missing directories and non-directories instead of suggesting from another report", async () => {
    await assert.rejects(() => loadSuggestSignals(join(fixtures, "missing-results")), /results directory|ENOENT/);
    await assert.rejects(() => loadSuggestSignals(join(fixtures, "dogfood-report/summary.json")), /results.*directory/i);
  });
});
