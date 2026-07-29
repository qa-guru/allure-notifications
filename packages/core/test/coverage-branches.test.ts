/**
 * Focused branch/line coverage for packages/core — edge cases not hit by dogfood fixtures.
 */

import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { parseConfig } from "@allure-notifications/config";

import {
  DEFAULT_EMPTY_MESSAGE,
  PYRAMID_GEOMETRY,
  adaptSummaryJson,
  buildAnalytics,
  hexToRgb,
  historyFromRuns,
  historyWithBuckets,
  isHistoryEmpty,
  layerBreakdownFrom,
  loadHistoryAnalytics,
  loadReportAnalytics,
  orderedSeverities,
  parseTestResult,
  readAllureResults,
  readHistoryFile,
  renderCollagePng,
  renderCoverageDiffPanel,
  renderDurationDynamicsPanel,
  renderEmptyPanel,
  renderProblemsDistributionPanel,
  renderSeveritiesPanel,
  renderStabilityDistributionPanel,
  renderStatusAgePyramidPanel,
  renderStatusDynamicsPanel,
  renderStatusTransitionsPanel,
  renderSuccessRateDistributionPanel,
  renderSuitesPanel,
  renderTestBaseGrowthPanel,
  resolveCardTitle,
  resolveGroupByLabel,
  resolveHistoryFile,
  resolveResultsFolder,
  stackedSegmentHeights,
  themeFromDarkMode,
} from "../src/index.js";
import { panelContext } from "../src/collage/context.js";
import { renderDurationsPanel } from "../src/collage/panels/durations.js";
import { renderPiePanel } from "../src/collage/panels/pie.js";
import { renderPyramidPanel } from "../src/collage/panels/pyramid.js";
import {
  cardBorder,
  headerBackground,
  headerText,
  outerBackground,
} from "../src/theme.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

function emptySummary() {
  return adaptSummaryJson(null);
}

function bareConfig(opts: {
  darkMode?: boolean;
  allureFolder?: string;
  allureResultsFolder?: string;
  historyPath?: string;
  items?: Array<{ type: string; x?: number; y?: number; w?: number; h?: number; groupBy?: string }>;
  headerHeight?: number;
  cardGap?: number;
} = {}) {
  return parseConfig({
    base: {
      project: "coverage",
      allureFolder: opts.allureFolder ?? join(fixtures, "allure3-report"),
      allureResultsFolder:
        opts.allureResultsFolder ?? join(fixtures, "allure-results"),
      enableChart: true,
      darkMode: opts.darkMode ?? false,
      chart: {
        mode: "collage",
        layout: "free",
        width: 400,
        height: 300,
        headerHeight: opts.headerHeight,
        cardGap: opts.cardGap,
        gridCols: 6,
        gridRows: 6,
        pyramidFallback: "suites",
        historyPath: opts.historyPath,
        items: opts.items ?? [{ type: "pie", x: 0, y: 0, w: 1, h: 1 }],
      },
    },
  });
}

describe("@allure-notifications/core coverage theme", () => {
  it("hexToRgb expands 3-char hex; light theme palette helpers", () => {
    const rgb = hexToRgb("#abc");
    assert.equal(rgb.r, 0xaa);
    assert.equal(rgb.g, 0xbb);
    assert.equal(rgb.b, 0xcc);

    const light = themeFromDarkMode(false);
    assert.equal(light.dark, false);
    assert.deepEqual(outerBackground(light), { r: 240, g: 240, b: 242 });
    assert.deepEqual(cardBorder(light), { r: 210, g: 210, b: 214 });
    assert.deepEqual(headerBackground(light), { r: 247, g: 247, b: 249 });
    assert.deepEqual(headerText(light), { r: 90, g: 90, b: 90 });
  });
});

describe("@allure-notifications/core coverage report helpers", () => {
  it("adaptSummaryJson: invalid root, string numerics, empty shape", () => {
    const fromStrings = adaptSummaryJson({
      stats: {
        passed: "2",
        failed: "1",
        total: "3",
      },
      duration: "1500",
    });
    assert.equal(fromStrings.statistic.passed, 2);
    assert.equal(fromStrings.durationMs, 1500);

    const empty = adaptSummaryJson(null);
    assert.equal(empty.statistic.total, 0);
    assert.equal(empty.durationMs, 0);

    const unknown = adaptSummaryJson({ foo: 1 });
    assert.equal(unknown.statistic.total, 0);
  });

  it("parseTestResult + readAllureResults edge paths", async () => {
    assert.equal(parseTestResult(null), null);
    assert.equal(parseTestResult("x"), null);

    const parsed = parseTestResult({
      name: "t",
      labels: ["bad", { name: 1, value: "x" }, { name: "layer", value: "unit" }],
    });
    assert.ok(parsed);
    assert.equal(parsed!.labels.length, 1);

    const nonArrayLabels = parseTestResult({ name: "t2", labels: "nope" });
    assert.ok(nonArrayLabels);
    assert.equal(nonArrayLabels!.labels.length, 0);

    const dir = await mkdtemp(join(tmpdir(), "an-core-res-"));
    const nested = join(dir, "a", "b", "c", "d", "e", "f", "g", "h", "i");
    await mkdir(nested, { recursive: true });
    await writeFile(join(nested, "deep-result.json"), '{"name":"deep"}');

    const shallow = await mkdtemp(join(tmpdir(), "an-core-shallow-"));
    await writeFile(join(shallow, "ok-result.json"), '{"name":"ok","labels":[]}');
    await writeFile(join(shallow, "bad-result.json"), "not-json");

    const noRead = await mkdtemp(join(tmpdir(), "an-core-noread-"));
    const blockedDir = join(noRead, "blocked");
    await mkdir(blockedDir, { mode: 0o000 });

    assert.deepEqual(await readAllureResults(null), []);
    assert.deepEqual(await readAllureResults(join(shallow, "missing")), []);
    await writeFile(join(shallow, "not-a-dir"), "x");
    assert.deepEqual(await readAllureResults(join(shallow, "not-a-dir")), []);

    const deepResults = await readAllureResults(dir);
    assert.equal(deepResults.length, 0);

    const okResults = await readAllureResults(shallow);
    assert.equal(okResults.length, 1);
    assert.equal(okResults[0]!.name, "ok");

    const blocked = await readAllureResults(blockedDir);
    assert.equal(blocked.length, 0);
    await chmod(blockedDir, 0o700);
  });

  it("resolveResultsFolder sibling, nested, explicit, fallback", async () => {
    const root = await mkdtemp(join(tmpdir(), "an-core-resolve-"));
    const report = join(root, "allure-report");
    const sibling = join(root, "allure-results");
    const nested = join(report, "allure-results");
    await mkdir(report, { recursive: true });
    await mkdir(sibling, { recursive: true });
    await mkdir(nested, { recursive: true });

    assert.equal(await resolveResultsFolder("/explicit/path", report), "/explicit/path");
    assert.equal(await resolveResultsFolder("  /trimmed  ", undefined), "/trimmed");
    assert.equal(await resolveResultsFolder(undefined, undefined), null);

    const siblingHit = await resolveResultsFolder(undefined, report);
    assert.equal(siblingHit, sibling);

    const nestedRoot = await mkdtemp(join(tmpdir(), "an-core-nested-only-"));
    const onlyNested = join(nestedRoot, "report-only");
    const nestedOnly = join(onlyNested, "allure-results");
    await mkdir(nestedOnly, { recursive: true });
    assert.equal(await resolveResultsFolder(undefined, onlyNested), nestedOnly);

    const nestedInReport = await mkdtemp(join(tmpdir(), "an-core-nested-in-"));
    const reportOnly = join(nestedInReport, "report");
    const nestedInside = join(reportOnly, "allure-results");
    await mkdir(nestedInside, { recursive: true });
    assert.equal(await resolveResultsFolder(undefined, reportOnly), nestedInside);

    const noResults = join(root, "no-results-report");
    await mkdir(noResults, { recursive: true });
    const fallback = join(noResults, "..", "allure-results");
    assert.equal(await resolveResultsFolder(undefined, noResults), fallback);

    const isolated = await mkdtemp(join(tmpdir(), "an-core-isolated-"));
    const lonelyReport = join(isolated, "lonely-report");
    await mkdir(lonelyReport, { recursive: true });
    const missingSibling = join(isolated, "allure-results");
    assert.equal(await resolveResultsFolder(undefined, lonelyReport), missingSibling);
  });

  it("loadReportAnalytics falls back when summary paths missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-core-no-summary-"));
    const config = parseConfig({
      base: {
        project: "missing-summary",
        allureFolder: join(dir, "missing-report"),
        allureResultsFolder: join(dir, "missing-results"),
        enableChart: true,
      },
    });
    await assert.rejects(() => loadReportAnalytics(config));
  });

  it("loadReportAnalytics resolves widgets summary + optional history", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-core-load-"));
    const report = join(dir, "report");
    const results = join(dir, "allure-results");
    const widgets = join(report, "widgets");
    await mkdir(widgets, { recursive: true });
    await mkdir(results, { recursive: true });
    await writeFile(
      join(widgets, "summary.json"),
      JSON.stringify({
        stats: { passed: 1, failed: 0, total: 1 },
        duration: 100,
      }),
    );
    await writeFile(
      join(results, "t-result.json"),
      JSON.stringify({ name: "t", status: "passed", labels: [] }),
    );
    await writeFile(
      join(dir, "history.jsonl"),
      '{"uuid":"h1","timestamp":1,"testResults":{"a":{"id":"a","status":"passed","duration":1}}}\n',
    );

    const config = parseConfig({
      base: {
        project: "load",
        allureFolder: report,
        allureResultsFolder: results,
        enableChart: true,
        chart: { historyPath: join(dir, "history.jsonl") },
      },
    });
    const analytics = await loadReportAnalytics(config);
    assert.equal(analytics.resultCount, 1);
    assert.ok(analytics.history);
  });
});

describe("@allure-notifications/core coverage history", () => {
  it("historyWithBuckets + isHistoryEmpty + groupBy + normalizeStatus", () => {
    const buckets = new Array(10).fill(0);
    buckets[9] = 2;
    const h = historyWithBuckets(buckets);
    assert.equal(h.runCount, 1);
    assert.equal(h.successRateDistribution[9], 2);
    assert.equal(isHistoryEmpty(null), true);
    assert.equal(isHistoryEmpty(h), false);

    assert.equal(resolveGroupByLabel(null), "feature");
    assert.equal(resolveGroupByLabel("  "), "feature");
    assert.equal(resolveGroupByLabel("label-name:component"), "component");
    assert.equal(resolveGroupByLabel("label-name:  "), "feature");
  });

  it("historyFromRuns: added/removed coverage, duration start/stop, null result", () => {
    const added = historyFromRuns([
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "Keep" }],
          },
        },
      },
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "Keep" }],
          },
          b: {
            id: "b",
            status: "passed",
            labels: [{ name: "feature", value: "AddedOnly" }],
          },
        },
      },
    ]);
    assert.ok(added.coverageDiff.some((c) => c.kind === "added"));

    const removed = historyFromRuns([
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "Keep" }],
          },
          c: {
            id: "c",
            status: "passed",
            labels: [{ name: "feature", value: "RemovedOnly" }],
          },
        },
      },
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "Keep" }],
          },
        },
      },
    ]);
    assert.ok(removed.coverageDiff.some((c) => c.kind === "removed"));

    const durationRuns = historyFromRuns([
      {
        testResults: {
          t: { id: "t", status: "passed", start: 100, stop: 500 },
        },
      },
    ]);
    assert.equal(durationRuns.durationDynamics.length, 1);
    assert.ok(durationRuns.durationDynamics[0]! > 0);

    const weird = historyFromRuns([
      {
        testResults: {
          ok: { id: "ok", status: "weird-status", duration: 1 },
          skip: null as unknown as import("../src/report/history.js").HistoryTestResult,
        },
      },
    ]);
    assert.equal(weird.statusDynamics[0]!.unknown, 1);

    const noEnvProblems = historyFromRuns([
      {
        testResults: {
          f: { id: "f", status: "failed", duration: 1 },
        },
      },
    ]);
    assert.equal(noEnvProblems.problemsByEnvironment.environments.length, 0);
  });

  it("readHistoryFile: missing file, bad lines, limit slice", async () => {
    assert.deepEqual(await readHistoryFile(join(fixtures, "missing-history.jsonl")), []);

    const dir = await mkdtemp(join(tmpdir(), "an-hist-"));
    const file = join(dir, "history.jsonl");
    const lines = [];
    for (let i = 0; i < 25; i++) {
      lines.push(
        JSON.stringify({
          uuid: `r${i}`,
          timestamp: i,
          testResults: { t: { id: "t", status: "passed", duration: 1 } },
        }),
      );
    }
    lines.push("not-json");
    lines.push(JSON.stringify({ uuid: "bad", testResults: "nope" }));
    await writeFile(file, `${lines.join("\n")}\n`);

    const limited = await readHistoryFile(file, 5);
    assert.equal(limited.length, 5);
    assert.equal(limited[0]!.timestamp, 20);
  });

  it("resolveHistoryFile + loadHistoryAnalytics configured/missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-hist-resolve-"));
    const report = join(dir, "report");
    await mkdir(report, { recursive: true });
    const hist = join(dir, "custom-history.jsonl");
    await writeFile(hist, '{"uuid":"1","timestamp":1,"testResults":{}}\n');

    const withPath = bareConfig({
      allureFolder: report,
      historyPath: hist,
    });
    assert.equal(
      await resolveHistoryFile(withPath, report, null),
      hist,
    );

    const relConfig = bareConfig({
      allureFolder: report,
      historyPath: "custom-history.jsonl",
    });
    assert.equal(
      await resolveHistoryFile(relConfig, report, null),
      hist,
    );

    const missingLoad = await loadHistoryAnalytics(
      bareConfig({ allureFolder: report, historyPath: join(dir, "nope.jsonl") }),
      report,
      null,
    );
    assert.equal(missingLoad, null);

    await writeFile(join(report, "history.jsonl"), '{"uuid":"a","timestamp":1,"testResults":{}}\n');
    const auto = await loadHistoryAnalytics(bareConfig({ allureFolder: report }), report, null);
    assert.ok(auto);
  });

  it("resolveHistoryFile discovers cwd-relative and parent candidates", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-hist-paths-"));
    const report = join(dir, "report");
    await mkdir(report, { recursive: true });

    const cwdHist = join(process.cwd(), "history-coverage-probe.jsonl");
    await writeFile(cwdHist, '{"uuid":"c","timestamp":1,"testResults":{}}\n');
    try {
      const cwdConfig = bareConfig({
        allureFolder: report,
        historyPath: "history-coverage-probe.jsonl",
      });
      assert.equal(
        await resolveHistoryFile(cwdConfig, report, null),
        cwdHist,
      );
    } finally {
      await import("node:fs/promises").then(({ unlink }) => unlink(cwdHist));
    }

    await writeFile(join(report, "report-local.jsonl"), '{"uuid":"r","timestamp":1,"testResults":{}}\n');
    const reportLocal = bareConfig({
      allureFolder: report,
      historyPath: "report-local.jsonl",
    });
    assert.equal(
      await resolveHistoryFile(reportLocal, report, null),
      join(report, "report-local.jsonl"),
    );

    await writeFile(join(dir, "parent-local.jsonl"), '{"uuid":"p","timestamp":1,"testResults":{}}\n');
    const parentLocal = bareConfig({
      allureFolder: report,
      historyPath: "parent-local-probe-659.jsonl",
    });
    await writeFile(
      join(dir, "parent-local-probe-659.jsonl"),
      '{"uuid":"p","timestamp":1,"testResults":{}}\n',
    );
    assert.equal(
      await resolveHistoryFile(parentLocal, report, null),
      join(dir, "parent-local-probe-659.jsonl"),
    );

    const missingName = "missing-history-fallback-probe.jsonl";
    const missingConfig = bareConfig({
      allureFolder: report,
      historyPath: missingName,
    });
    assert.equal(
      await resolveHistoryFile(missingConfig, report, null),
      join(process.cwd(), missingName),
    );

    assert.equal(
      await resolveHistoryFile(bareConfig({ allureFolder: report }), join(dir, "missing-report"), null),
      null,
    );
  });

  it("status age pyramid data from consecutive failed runs", () => {
    const runs = historyFromRuns([
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
    ]);
    const total = runs.statusAgePyramid.reduce(
      (s, b) => s + b.failed + b.broken + b.skipped + b.unknown,
      0,
    );
    assert.ok(total >= 1);
  });
});

describe("@allure-notifications/core coverage collage render defaults", () => {
  it("default free items when chart.items omitted; header/gap defaults", async () => {
    const summary = adaptSummaryJson({
      stats: { passed: 2, failed: 1, total: 3 },
      duration: 1000,
    });
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);

    const config = parseConfig({
      base: {
        project: "defaults",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 600,
          height: 400,
          gridCols: 10,
          gridRows: 10,
          items: [{ type: "pie", x: 0, y: 0, w: 10, h: 10 }],
        },
      },
    });
    config.base.chart!.items = [];
    const png = await renderCollagePng(config, analytics);
    assert.ok(png.length > 500);
  });

  it("clamp undefined grid coords and skip null panel type", async () => {
    const summary = adaptSummaryJson({
      stats: { passed: 1, total: 1 },
      duration: 1,
    });
    const analytics = buildAnalytics(summary, []);
    const config = parseConfig({
      base: {
        project: "clamp",
        allureFolder: join(fixtures, "allure3-report"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 200,
          height: 200,
          gridCols: 4,
          gridRows: 4,
          items: [
            { type: "pie", x: 0, y: 0, w: 2, h: 2 },
            { type: "totallyUnknown", x: 2, y: 0, w: 2, h: 2 },
          ],
        },
      },
    });
    config.base.chart!.items = [
      { type: "pie", y: 0, w: 2, h: 2 },
      { type: null as unknown as string, x: 0, y: 2, w: 2, h: 2 },
    ] as NonNullable<typeof config.base.chart>["items"];
    const png = await renderCollagePng(config, analytics);
    assert.ok(png.length > 100);
  });

  it("resolveCardTitle treats null panel type as unknown", () => {
    const summary = adaptSummaryJson({ stats: { passed: 1, total: 1 }, duration: 0 });
    const analytics = buildAnalytics(summary, []);
    const config = bareConfig();
    assert.equal(
      resolveCardTitle(
        { type: null as unknown as string, x: 0, y: 0, w: 1, h: 1 },
        config,
        analytics,
      ),
      "Panel",
    );
  });
});

describe("@allure-notifications/core coverage panels edge UI", () => {
  function ctx(
    analytics: ReturnType<typeof buildAnalytics>,
    opts: {
      dark?: boolean;
      showTitle?: boolean;
      w?: number;
      h?: number;
      groupBy?: string;
      by?: string;
    } = {},
  ) {
    return panelContext(
      bareConfig({ darkMode: opts.dark === false ? false : true }),
      themeFromDarkMode(opts.dark === false ? false : true),
      opts.w ?? 320,
      opts.h ?? 200,
      analytics,
      {
        showTitle: opts.showTitle ?? true,
        groupBy: opts.groupBy,
        by: opts.by,
      },
    );
  }

  it("empty panel: light theme, opts variants, showTitle+title", () => {
    const light = themeFromDarkMode(false);
    const base = panelContext(bareConfig(), light, 200, 120, buildAnalytics(emptySummary(), []), {
      showTitle: true,
    });
    assert.ok(renderEmptyPanel(base).length > 0);
    assert.ok(renderEmptyPanel(base, null as unknown as string).length > 0);
    assert.ok(renderEmptyPanel(base, "").length > 0);
    assert.ok(renderEmptyPanel(base, { message: "  ", title: "Tile" }).length > 0);
    assert.ok(
      renderEmptyPanel(base, { message: "Custom", title: "Header" }).length > 0,
    );
    assert.ok(renderEmptyPanel(base, DEFAULT_EMPTY_MESSAGE).length > 0);
  });

  it("suites/severities empty + truncate long names", () => {
    const empty = buildAnalytics(emptySummary(), []);
    assert.ok(renderSuitesPanel(ctx(empty)).length > 0);

    const longName = "Suite-" + "x".repeat(40);
    const withSuite = buildAnalytics(emptySummary(), [
      {
        name: "t",
        labels: [{ name: "suite", value: longName }],
      },
    ]);
    assert.ok(renderSuitesPanel(ctx(withSuite)).length > 0);
    assert.deepEqual(orderedSeverities({}), []);
    assert.ok(renderSeveritiesPanel(ctx(empty)).length > 0);

    const sev = buildAnalytics(emptySummary(), [
      {
        name: "t",
        labels: [{ name: "severity", value: "minor" }],
      },
      {
        name: "t2",
        labels: [{ name: "severity", value: "custom-sev" }],
      },
      {
        name: "t3",
        labels: [{ name: "severity", value: "trivial" }],
      },
    ]);
    assert.ok(renderSeveritiesPanel(ctx(sev)).length > 0);
  });

  it("pyramid: unknown layers, light other band, empty layers, showTitle", () => {
    const light = themeFromDarkMode(false);
    const mixed = buildAnalytics(emptySummary(), [
      { name: "u", labels: [{ name: "layer", value: "unit" }] },
      { name: "x", labels: [{ name: "layer", value: "custom-layer" }] },
    ]);
    const mixedCfg = parseConfig({
      base: {
        project: "pyr",
        allureFolder: "a",
        enableChart: true,
        darkMode: false,
        chart: {
          pyramidFallback: "none",
          items: [{ type: "testingPyramid", x: 0, y: 0, w: 1, h: 1 }],
        },
      },
    });
    const pctx = panelContext(mixedCfg, light, 300, 220, mixed, { showTitle: true });
    assert.ok(renderPyramidPanel(pctx).length > 0);

    const breakdown = layerBreakdownFrom({ unit: 2, "": 0, bogus: -1 });
    assert.equal(breakdown.knownCounts.get("unit"), 2);

    const noDataCfg = parseConfig({
      base: {
        project: "pyr-empty",
        allureFolder: "a",
        enableChart: true,
        chart: {
          pyramidFallback: "none",
          items: [{ type: "testingPyramid", x: 0, y: 0, w: 1, h: 1 }],
        },
      },
    });
    assert.ok(
      renderPyramidPanel(
        panelContext(noDataCfg, light, 280, 200, buildAnalytics(emptySummary(), []), {
          showTitle: true,
        }),
      ).length > 0,
    );
    void PYRAMID_GEOMETRY;
  });

  it("durations: layer groupBy, empty layer avg, empty histogram, showTitle", () => {
    const withLayers = buildAnalytics(emptySummary(), [
      {
        name: "u",
        start: 0,
        stop: 2000,
        labels: [{ name: "layer", value: "unit" }],
      },
      {
        name: "x",
        start: 0,
        stop: 3000,
        labels: [{ name: "layer", value: "extra-layer" }],
      },
    ]);
    withLayers.durationsMsByLayer["empty-layer"] = [];
    assert.ok(
      renderDurationsPanel(ctx(withLayers, { groupBy: "layer", showTitle: true })).length > 0,
    );

    const layerNoSamples = buildAnalytics(emptySummary(), []);
    assert.ok(
      renderDurationsPanel(ctx(layerNoSamples, { groupBy: "layer", showTitle: true })).length >
        0,
    );

    const flat = buildAnalytics(emptySummary(), [
      { name: "t", start: 100, stop: 1100, labels: [] },
      { name: "t2", start: 200, stop: 1200, labels: [] },
    ]);
    assert.ok(renderDurationsPanel(ctx(flat, { showTitle: true })).length > 0);
  });

  it("pie: empty ring light, dominant failed segment, tiny width font fit", () => {
    const light = themeFromDarkMode(false);
    const emptyStats = buildAnalytics(
      adaptSummaryJson({ stats: { total: 0, passed: 0 }, duration: 0 }),
      [],
    );
    const pieCtx = panelContext(bareConfig(), light, 120, 120, emptyStats);
    assert.ok(renderPiePanel(pieCtx).length > 0);

    const single = buildAnalytics(
      adaptSummaryJson({ stats: { passed: 5, total: 5 }, duration: 0 }),
      [],
    );
    assert.ok(renderPiePanel(panelContext(bareConfig(), light, 160, 160, single)).length > 0);

    const skewed = buildAnalytics(
      adaptSummaryJson({
        stats: {
          passed: 5,
          failed: 90,
          broken: 3,
          skipped: 1,
          unknown: 1,
          total: 100,
        },
        duration: 0,
      }),
      [],
    );
    assert.ok(renderPiePanel(panelContext(bareConfig(), light, 200, 200, skewed)).length > 0);

    const tiny = panelContext(bareConfig(), light, 40, 40, skewed);
    assert.ok(renderPiePanel(tiny).length > 0);
  });

  it("problems distribution: empty history, no env, empty matrix cols", () => {
    const noHist = buildAnalytics(emptySummary(), []);
    assert.ok(renderProblemsDistributionPanel(ctx(noHist, { showTitle: true })).length > 0);

    const histNoEnv = buildAnalytics(emptySummary(), [], 10, {
      ...historyFromRuns([
        { testResults: { f: { id: "f", status: "failed", duration: 1 } } },
      ]),
      problemsByEnvironment: { environments: [], matrix: [] },
    });
    assert.ok(renderProblemsDistributionPanel(ctx(histNoEnv, { showTitle: true })).length > 0);

    const histEmptyMatrix = buildAnalytics(emptySummary(), [], 10, {
      ...historyFromRuns([]),
      runCount: 1,
      problemsByEnvironment: { environments: ["chrome"], matrix: [[]] },
    });
    assert.ok(renderProblemsDistributionPanel(ctx(histEmptyMatrix)).length > 0);
  });

  it("history panels: empty transitions/growth/duration/coverage/success/age", () => {
    const shell = historyWithBuckets(new Array(10).fill(0));
    const analytics = buildAnalytics(emptySummary(), [], 10, shell);

    assert.ok(renderStatusTransitionsPanel(ctx(analytics)).length > 0);
    assert.ok(renderTestBaseGrowthPanel(ctx(analytics)).length > 0);
    assert.ok(renderDurationDynamicsPanel(ctx(analytics)).length > 0);
    assert.ok(renderCoverageDiffPanel(ctx(analytics)).length > 0);
    assert.ok(renderSuccessRateDistributionPanel(ctx(analytics)).length > 0);
    assert.ok(renderStatusAgePyramidPanel(ctx(analytics)).length > 0);

    const dyn = historyFromRuns([
      { testResults: { t: { id: "t", status: "passed", duration: 1 } } },
    ]);
    assert.ok(renderStatusDynamicsPanel(ctx(buildAnalytics(emptySummary(), [], 10, dyn))).length > 0);

    // Hits statusColor default branch (STATUS_KEYS includes "unknown", no explicit case).
    const withUnknown = historyFromRuns([
      {
        testResults: {
          u: { id: "u", status: "mystery", duration: 1 },
          p: { id: "p", status: "passed", duration: 1 },
        },
      },
    ]);
    assert.equal(withUnknown.statusDynamics[0]!.unknown, 1);
    assert.ok(
      renderStatusDynamicsPanel(
        ctx(buildAnalytics(emptySummary(), [], 10, withUnknown)),
      ).length > 0,
    );
  });

  it("stability: showTitle + empty bars", () => {
    const empty = buildAnalytics(emptySummary(), [], 10, historyWithBuckets([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    assert.ok(renderStabilityDistributionPanel(ctx(empty, { showTitle: true })).length > 0);
  });

  it("stackedSegmentHeights early exits", () => {
    assert.deepEqual(stackedSegmentHeights(0, [1]), []);
    assert.deepEqual(stackedSegmentHeights(10, []), []);
    assert.deepEqual(stackedSegmentHeights(10, [0, 0]), []);
  });
});
