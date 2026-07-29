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
  stabilityBarsFromCases,
  stackedSegmentHeights,
  themeFromDarkMode,
} from "../src/index.js";
import { panelContext } from "../src/collage/context.js";
import {
  fillPill,
  fillStackedVertical,
  fillTopRounded,
  horizontalBarRowsLayout,
} from "../src/collage/panels/bars.js";
import { renderDurationsPanel } from "../src/collage/panels/durations.js";
import { renderPiePanel } from "../src/collage/panels/pie.js";
import { renderPyramidPanel } from "../src/collage/panels/pyramid.js";
import {
  cardBorder,
  headerBackground,
  headerText,
  outerBackground,
} from "../src/theme.js";
import { createCanvas } from "@napi-rs/canvas";

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

  it("bars helpers: rowTop + zero-size early returns", () => {
    const layout = horizontalBarRowsLayout(200, true, 3);
    assert.equal(typeof layout.rowTop, "function");
    assert.ok(layout.rowTop(1) > layout.rowTop(0));

    const canvas = createCanvas(40, 40);
    const g = canvas.getContext("2d");
    g.fillStyle = "#000";
    fillStackedVertical(g, 0, 0, 0, 10, 4, true, true);
    fillStackedVertical(g, 0, 0, 10, 0, 4, true, true);
    fillTopRounded(g, 0, 0, 0, 10, 4);
    fillPill(g, 0, 0, 0, 8);
    fillPill(g, 0, 0, 8, 0);
    // Non-rounded fill path (maxArc 0).
    fillStackedVertical(g, 2, 2, 12, 12, 0, false, false);
  });

  it("empty panel dark headline + title trim fallthrough", () => {
    const dark = themeFromDarkMode(true);
    const base = panelContext(
      bareConfig({ darkMode: true }),
      dark,
      200,
      120,
      buildAnalytics(emptySummary(), []),
      { showTitle: true },
    );
    assert.ok(renderEmptyPanel(base, { message: "Hi", title: "Dark" }).length > 0);
    assert.ok(renderEmptyPanel(base, { message: "Hi", title: "   " }).length > 0);
    assert.ok(renderEmptyPanel(base, { message: "Hi" }).length > 0);
  });

  it("pie empty ring dark + suites null truncate", () => {
    const dark = themeFromDarkMode(true);
    const emptyStats = buildAnalytics(
      adaptSummaryJson({ stats: { total: 0, passed: 0 }, duration: 0 }),
      [],
    );
    assert.ok(
      renderPiePanel(
        panelContext(bareConfig({ darkMode: true }), dark, 120, 120, emptyStats),
      ).length > 0,
    );

    const suites = buildAnalytics(emptySummary(), []);
    suites.suites = [{ name: null as unknown as string, count: 2 }];
    assert.ok(renderSuitesPanel(ctx(suites)).length > 0);
  });

  it("pyramid light other + unknown layer fallback colors", () => {
    const light = themeFromDarkMode(false);
    const dark = themeFromDarkMode(true);
    // Only unknown layers → OTHER band (light + dark other palette).
    const onlyOther = buildAnalytics(emptySummary(), [
      { name: "o", labels: [{ name: "layer", value: "custom-other" }] },
      { name: "x", labels: [{ name: "layer", value: "totally-unknown-layer" }] },
    ]);
    const cfg = parseConfig({
      base: {
        project: "pyr-light",
        allureFolder: "a",
        enableChart: true,
        darkMode: false,
        chart: {
          pyramidFallback: "none",
          items: [{ type: "testingPyramid", x: 0, y: 0, w: 1, h: 1 }],
        },
      },
    });
    assert.ok(
      renderPyramidPanel(
        panelContext(cfg, light, 300, 220, onlyOther, { showTitle: true }),
      ).length > 0,
    );
    assert.ok(
      renderPyramidPanel(
        panelContext(
          { ...cfg, base: { ...cfg.base, darkMode: true } },
          dark,
          300,
          220,
          onlyOther,
          { showTitle: true },
        ),
      ).length > 0,
    );
  });

  it("durations histogram range + unknown layer accent fallback", () => {
    // First sample is not the min → hits `v < min` while scanning.
    const varied = buildAnalytics(emptySummary(), [
      { name: "a", start: 0, stop: 2000, labels: [] },
      { name: "b", start: 0, stop: 100, labels: [] },
      { name: "c", start: 0, stop: 900, labels: [] },
      { name: "d", start: 0, stop: 1200, labels: [] },
      { name: "e", start: 0, stop: 500, labels: [] },
      { name: "f", start: 0, stop: 1800, labels: [] },
    ]);
    assert.ok(renderDurationsPanel(ctx(varied, { showTitle: true })).length > 0);

    const same = buildAnalytics(emptySummary(), [
      { name: "a", start: 0, stop: 1000, labels: [] },
      { name: "b", start: 0, stop: 1000, labels: [] },
    ]);
    assert.ok(renderDurationsPanel(ctx(same)).length > 0);

    const layers = buildAnalytics(emptySummary(), [
      {
        name: "x",
        start: 0,
        stop: 1500,
        labels: [{ name: "layer", value: "no-palette-layer-xyz" }],
      },
    ]);
    assert.ok(
      renderDurationsPanel(
        ctx(layers, { groupBy: "layer", showTitle: true, dark: false }),
      ).length > 0,
    );
  });

  it("coverage diff: kinds, long labels, light unchanged, zero-count layout", () => {
    const hist = historyFromRuns([
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "KeepFeature" }],
          },
          r: {
            id: "r",
            status: "passed",
            labels: [{ name: "feature", value: "RemovedOnlyVeryLongName" }],
          },
        },
      },
      {
        testResults: {
          a: {
            id: "a",
            status: "passed",
            labels: [{ name: "feature", value: "KeepFeature" }],
          },
          b: {
            id: "b",
            status: "passed",
            labels: [{ name: "feature", value: "AddedOnlyVeryLongName" }],
          },
        },
      },
    ]);
    const analytics = buildAnalytics(emptySummary(), [], 10, hist);
    assert.ok(
      renderCoverageDiffPanel(ctx(analytics, { dark: false, showTitle: true, w: 480, h: 320 }))
        .length > 0,
    );
    assert.ok(renderCoverageDiffPanel(ctx(analytics, { showTitle: true, w: 480, h: 320 })).length > 0);

    const zeroCounts = buildAnalytics(emptySummary(), [], 10, {
      ...hist,
      coverageDiff: [
        { name: "A", kind: "added", count: 0 },
        { name: "B", kind: "removed", count: 0 },
        { name: "C", kind: "unchanged", count: 0 },
      ],
    });
    assert.ok(renderCoverageDiffPanel(ctx(zeroCounts, { w: 200, h: 120 })).length > 0);

    // width - MARGIN*2 <= 0 → layoutTreemap early-return on non-empty cells.
    assert.ok(renderCoverageDiffPanel(ctx(analytics, { w: 20, h: 20 })).length > 0);
  });

  it("problems distribution: sparse matrix, long env, light theme", () => {
    const analytics = buildAnalytics(emptySummary(), [], 10, {
      ...historyFromRuns([]),
      runCount: 2,
      problemsByEnvironment: {
        environments: ["chrome-desktop-long"],
        matrix: [[1, undefined as unknown as number]],
      },
    });
    assert.ok(
      renderProblemsDistributionPanel(
        ctx(analytics, { dark: false, showTitle: true, w: 360, h: 220 }),
      ).length > 0,
    );

    const emptyMatrixRows = buildAnalytics(emptySummary(), [], 10, {
      ...historyFromRuns([]),
      runCount: 1,
      problemsByEnvironment: { environments: ["firefox"], matrix: [] },
    });
    assert.ok(renderProblemsDistributionPanel(ctx(emptyMatrixRows)).length > 0);
  });

  it("status dynamics incomplete keys + light theme history strokes", () => {
    const shell = historyWithBuckets([0, 0, 1, 0, 0, 0, 0, 0, 0, 2]);
    shell.statusDynamics = [{ passed: 1 } as Record<string, number>, { failed: 0 }];
    shell.statusTransitions = [{ fixed: 1, regressed: 1, malfunctioned: 0 }];
    shell.testBaseGrowth = [{ added: 2, removed: 1 }];
    shell.durationDynamics = [100];
    shell.stabilityCases = [
      {
        id: "s1",
        labels: { feature: "Auth" },
        passed: 8,
        total: 10,
      },
      {
        id: "s2",
        labels: { feature: "Pay" },
        passed: 9,
        total: 10,
      },
      {
        id: "s3",
        labels: { feature: "Flaky" },
        passed: 5,
        total: 10,
      },
    ];
    const analytics = buildAnalytics(emptySummary(), [], 10, shell);
    assert.ok(renderStatusDynamicsPanel(ctx(analytics)).length > 0);
    assert.ok(
      renderStatusTransitionsPanel(ctx(analytics, { dark: false })).length > 0,
    );
    assert.ok(renderTestBaseGrowthPanel(ctx(analytics, { dark: false })).length > 0);
    assert.ok(
      renderDurationDynamicsPanel(ctx(analytics, { dark: false })).length > 0,
    );
    assert.ok(
      renderStabilityDistributionPanel(
        ctx(analytics, { dark: false, groupBy: "feature", showTitle: true }),
      ).length > 0,
    );

    const oneBucket = buildAnalytics(emptySummary(), [], 10, {
      ...shell,
      successRateDistribution: [3],
    });
    assert.ok(renderSuccessRateDistributionPanel(ctx(oneBucket)).length > 0);

    const sparseBuckets = buildAnalytics(emptySummary(), [], 10, {
      ...shell,
      successRateDistribution: [1, , , 2] as number[],
    });
    assert.ok(renderSuccessRateDistributionPanel(ctx(sparseBuckets)).length > 0);
  });
});

describe("@allure-notifications/core coverage history deep edges", () => {
  it("normalizeStatus nullish + caseId empty + labelsMap first-wins", () => {
    const h = historyFromRuns([
      {
        testResults: {
          k1: {
            id: "",
            status: null as unknown as string,
            duration: 1,
            labels: [
              { name: "feature", value: "First" },
              { name: "feature", value: "Second" },
              { name: "host", value: "" },
              null as unknown as { name: string; value: string },
            ],
          },
        },
      },
    ]);
    assert.equal(h.statusDynamics[0]!.unknown, 1);
  });

  it("stabilityBarsFromCases null/zero-total/skip blank labels", () => {
    assert.deepEqual(stabilityBarsFromCases(null, "feature"), []);
    assert.deepEqual(
      stabilityBarsFromCases(
        [
          { id: "a", labels: { feature: "  " }, passed: 1, total: 1 },
          { id: "b", labels: {}, passed: 1, total: 1 },
          { id: "c", labels: { feature: "Ok" }, passed: 0, total: 0 },
          { id: "d", labels: { feature: "Ok" }, passed: 2, total: 2 },
        ],
        "feature",
      ),
      [{ name: "Ok", rate: 100 }],
    );
  });

  it("problems env from labels + durationDynamics null results", () => {
    const h = historyFromRuns([
      {
        testResults: {
          f: {
            id: "f",
            status: "failed",
            duration: 10,
            labels: [{ name: "environment", value: "stage-a" }],
          },
          n: null as unknown as import("../src/report/history.js").HistoryTestResult,
        },
      },
      {
        // missing testResults → ?? {}
        uuid: "r2",
      },
    ]);
    assert.deepEqual(h.problemsByEnvironment.environments, ["stage-a"]);
    assert.ok(h.durationDynamics.length >= 1);
  });

  it("status age: break on passed / status change mid-streak", () => {
    const changed = historyFromRuns([
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
      { testResults: { x: { id: "x", status: "broken", duration: 1 } } },
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
    ]);
    assert.ok(changed.statusAgePyramid.some((b) => b.failed + b.broken > 0));

    const healed = historyFromRuns([
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
      { testResults: { x: { id: "x", status: "passed", duration: 1 } } },
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
    ]);
    assert.ok(healed.statusAgePyramid.some((b) => b.failed > 0));

    const gap = historyFromRuns([
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
      { testResults: {} },
      { testResults: { x: { id: "x", status: "failed", duration: 1 } } },
    ]);
    assert.ok(gap.statusAgePyramid.some((b) => b.failed > 0));
  });

  it("historyFromRuns(null) empty shell + 100% success bucket clamp", () => {
    const empty = historyFromRuns(null);
    assert.equal(empty.runCount, 0);
    assert.deepEqual(empty.coverageDiff, []);

    const perfect = historyFromRuns([
      { testResults: { a: { id: "a", status: "passed", duration: 1 } } },
      { testResults: { a: { id: "a", status: "passed", duration: 1 } } },
    ]);
    assert.equal(perfect.successRateDistribution[9], 1);
  });

  it("readHistoryFile: missing timestamps + normalizeRun type filters", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-hist-norm-"));
    const file = join(dir, "history.jsonl");
    await writeFile(
      file,
      [
        JSON.stringify({
          uuid: "a",
          testResults: {
            t: {
              id: 12,
              name: 9,
              fullName: false,
              status: 0,
              duration: "1",
              start: "0",
              stop: "1",
              environment: 3,
              // All label rows invalid → asLabels returns undefined (empty out).
              labels: ["bad", { name: 1, value: 2 }, { name: "x" }],
            },
            skip: "nope",
          },
        }),
        JSON.stringify({
          uuid: "b",
          timestamp: 5,
          testResults: {
            t: {
              id: "t",
              name: "case-name",
              fullName: "suite.case-name",
              status: "passed",
              duration: 1,
              start: 10,
              stop: 20,
              environment: "ci",
              labels: [{ name: "feature", value: "Y" }],
            },
          },
        }),
        JSON.stringify({ uuid: "c", testResults: null }),
      ].join("\n"),
    );
    const runs = await readHistoryFile(file, 0);
    assert.ok(runs.length >= 2);
    assert.equal(runs[0]!.timestamp, undefined);
    const typed = runs.find((r) => r.uuid === "b")!.testResults!.t!;
    assert.equal(typed.name, "case-name");
    assert.equal(typed.fullName, "suite.case-name");
    assert.equal(typed.start, 10);
    assert.equal(typed.stop, 20);
  });

  it("loadHistoryAnalytics honors positive historyLimit", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-hist-limit-"));
    const report = join(dir, "report");
    await mkdir(report, { recursive: true });
    const hist = join(dir, "history.jsonl");
    const lines = [];
    for (let i = 0; i < 5; i++) {
      lines.push(
        JSON.stringify({
          uuid: `r${i}`,
          timestamp: i,
          testResults: { t: { id: "t", status: "passed", duration: 1 } },
        }),
      );
    }
    await writeFile(hist, `${lines.join("\n")}\n`);
    const config = bareConfig({
      allureFolder: report,
      historyPath: hist,
    });
    config.base.chart!.historyLimit = 2;
    const analytics = await loadHistoryAnalytics(config, report, null);
    assert.ok(analytics);
    assert.equal(analytics!.runCount, 2);
  });
});

describe("@allure-notifications/core coverage render + analytics edges", () => {
  it("renderCollagePng defaults when chart metrics missing/invalid", async () => {
    const summary = adaptSummaryJson({
      stats: { passed: 1, total: 1 },
      duration: 1,
    });
    const analytics = buildAnalytics(summary, []);
    const config = parseConfig({
      base: {
        project: "   ",
        allureFolder: join(fixtures, "allure3-report"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 400,
          height: 300,
          gridCols: 4,
          gridRows: 4,
          items: [{ type: "pie", x: 0, y: 0, w: 1, h: 1 }],
        },
      },
    });
    // Force undefined / non-positive metrics after parse (schema rejects zeros).
    const chart = config.base.chart as {
      width?: number;
      height?: number;
      gridCols?: number;
      gridRows?: number;
      items: Array<{ type: string; x?: number; y?: number; w?: number; h?: number }>;
    };
    chart.width = undefined;
    chart.height = undefined;
    chart.gridCols = undefined;
    chart.gridRows = undefined;
    // Omit x/y/w/h to hit clamp defaults; oversized tile hits overflow shrink.
    chart.items = [
      { type: "pie" },
      { type: "pie", x: 8, y: 8, w: 8, h: 8 },
    ];
    const png = await renderCollagePng(config, analytics);
    assert.ok(png.length > 100);
    assert.equal(
      resolveCardTitle({ type: "pie", x: 0, y: 0, w: 1, h: 1 }, config, analytics),
      "Summary",
    );

    // Also hit `> 0` false sides when metrics are explicitly non-positive.
    chart.width = -1;
    chart.height = -1;
    chart.gridCols = -1;
    chart.gridRows = -1;
    assert.ok((await renderCollagePng(config, analytics)).length > 100);
  });

  it("buildAnalytics epic/story/component + id fallback + durationMs null", () => {
    const summary = adaptSummaryJson({
      stats: { passed: 1, failed: 0, total: 1 },
      duration: null,
    });
    // Force nullish durationMs after adapt.
    summary.durationMs = undefined as unknown as number;
    const analytics = buildAnalytics(summary, [
      {
        status: "passed",
        labels: [
          { name: "epic", value: "E1" },
          { name: "story", value: "S1" },
          { name: "component", value: "C1" },
        ],
      },
    ]);
    assert.equal(analytics.stabilityCases[0]!.labels.epic, "E1");
    assert.equal(analytics.stabilityCases[0]!.labels.story, "S1");
    assert.equal(analytics.stabilityCases[0]!.labels.component, "C1");
    assert.equal(analytics.stabilityCases[0]!.id, "r-0");
    assert.equal(analytics.durationMs, 0);
  });

  it("loadReportAnalytics defaults allureFolder when missing", async () => {
    const config = parseConfig({
      base: {
        project: "no-folder",
        enableChart: true,
      },
    });
    delete (config.base as { allureFolder?: string }).allureFolder;
    await assert.rejects(() => loadReportAnalytics(config));
  });

  it("adaptSummaryJson Allure2 without time object + parseTestResult non-string status", () => {
    const a2 = adaptSummaryJson({
      statistic: { passed: 1, total: 1 },
    });
    assert.equal(a2.statistic.passed, 1);
    assert.equal(a2.durationMs, 0);

    const parsed = parseTestResult({
      uuid: 1,
      name: 2,
      fullName: 3,
      status: 123,
      start: "0",
      stop: "1",
      labels: [],
    });
    assert.ok(parsed);
    assert.equal(parsed!.uuid, undefined);
    assert.equal(parsed!.name, undefined);
    assert.equal(parsed!.fullName, undefined);
    assert.equal(parsed!.status, undefined);
    assert.equal(parsed!.start, undefined);
    assert.equal(parsed!.stop, undefined);
  });
});
