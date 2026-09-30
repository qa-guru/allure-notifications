import { stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { Config, SuggestSignals } from "@qa-guru/allure-notifications-config";
import { isKnownLayer } from "@qa-guru/allure-report-kit";

import { buildAnalytics, DEFAULT_TOP_SUITES } from "./analytics.js";
import { DEFAULT_HISTORY_FILE, DEFAULT_HISTORY_LIMIT, historyFromRuns, readHistoryFile, STATUS_KEYS } from "./history.js";
import { readAllureResults } from "./results.js";
import { readSummary } from "./summary.js";
import type { AllureTestResult, ReportAnalytics, Statistic, Summary } from "./types.js";

export function buildSuggestSignals(
  analytics: ReportAnalytics,
  config: Config = { base: {} },
): SuggestSignals {
  const rules = (config.qualityGate as { rules?: unknown } | null | undefined)?.rules;
  const chart = config.base.chart;
  return {
    statistic: { ...analytics.statistic },
    durationMs: analytics.durationMs,
    layers: { ...analytics.layers },
    hasLayerLabels: analytics.hasLayerLabels,
    hasKnownLayerLabels: analytics.hasKnownLayerLabels,
    knownLayerCount: Object.keys(analytics.layers).filter((layer) => isKnownLayer(layer) && analytics.layers[layer]! > 0).length,
    severities: { ...analytics.severities },
    suites: analytics.suites.map((suite) => ({ ...suite })),
    durationsMsByLayer: Object.fromEntries(Object.entries(analytics.durationsMsByLayer).map(([layer, durations]) => [layer, {
      count: durations.length,
      meanMs: durations.length ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0,
    }])),
    historyRunCount: analytics.history?.runCount ?? 0,
    qualityGateRuleCount: Array.isArray(rules) ? rules.length : 0,
    allureFolder: config.base.allureFolder?.trim() || undefined,
    historyPath: chart?.historyPath?.trim() || undefined,
    allureQualityGatePath: chart?.allureQualityGatePath?.trim() || undefined,
    sonarQualityGatePath: chart?.sonarQualityGatePath?.trim() || undefined,
    testsTablePath: chart?.testsTablePath?.trim() || undefined,
  };
}

function summaryFromResults(results: readonly AllureTestResult[]): Summary {
  const statistic: Statistic = { passed: 0, failed: 0, broken: 0, skipped: 0, unknown: 0, total: results.length };
  let start = Number.POSITIVE_INFINITY;
  let stop = Number.NEGATIVE_INFINITY;
  for (const result of results) {
    const status = result.status?.trim().toLowerCase();
    statistic[STATUS_KEYS.find((key) => key === status) ?? "unknown"]++;
    if (result.start != null && result.stop != null && result.stop >= result.start) {
      start = Math.min(start, result.start);
      stop = Math.max(stop, result.stop);
    }
  }
  return { statistic, durationMs: stop >= start ? stop - start : 0 };
}

async function firstFile(paths: readonly string[]): Promise<string | undefined> {
  for (const path of new Set(paths)) {
    try {
      if ((await stat(path)).isFile()) return path;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT" && code !== "ENOTDIR") throw err;
    }
  }
  return undefined;
}

async function payloadPath(
  explicit: string | undefined,
  filename: string,
  neighbours: readonly string[],
): Promise<string | undefined> {
  if (explicit?.trim()) return resolve(explicit.trim());
  return firstFile(neighbours.flatMap((dir) => [
    join(dir, filename),
    ...(filename === "sonarQualityGate.json" ? [] : [join(dir, "widgets/kit-panels", filename)]),
  ]));
}

export async function loadSuggestSignals(
  resultsPath: string,
  config: Config = { base: {} },
): Promise<SuggestSignals> {
  const resultsFolder = resolve(resultsPath);
  if (!(await stat(resultsFolder)).isDirectory()) {
    throw new Error(`results path is not a directory: ${resultsFolder}`);
  }
  const results = await readAllureResults(resultsFolder);
  const reportFolder = resolve(config.base.allureFolder?.trim() || join(resultsFolder, "../allure-report"));
  let allureFolder = reportFolder;
  let summary: Summary | undefined;
  for (const folder of new Set([resultsFolder, reportFolder])) {
    const path = await firstFile([join(folder, "summary.json"), join(folder, "widgets/summary.json")]);
    if (path) {
      summary = await readSummary(path);
      allureFolder = folder;
      break;
    }
  }
  summary ??= summaryFromResults(results);
  const neighbours = [...new Set([resultsFolder, dirname(resultsFolder), allureFolder, reportFolder])];
  const chart = config.base.chart;
  const historyPath = chart?.historyPath?.trim()
    ? resolve(chart.historyPath.trim())
    : await firstFile(neighbours.map((dir) => join(dir, DEFAULT_HISTORY_FILE)));
  const runs = historyPath
    ? (await readHistoryFile(historyPath, 0))
      .filter((run) => run.testResults && Object.keys(run.testResults).length > 0)
      .slice(-(chart?.historyLimit ?? DEFAULT_HISTORY_LIMIT))
    : [];
  const [allureQualityGatePath, sonarQualityGatePath, testsTablePath] = await Promise.all([
    payloadPath(chart?.allureQualityGatePath, "allureQualityGate.json", neighbours),
    payloadPath(chart?.sonarQualityGatePath, "sonarQualityGate.json", neighbours),
    payloadPath(chart?.testsTablePath, "testsTable.json", neighbours),
  ]);
  const resolved: Config = {
    ...config,
    base: {
      ...config.base,
      allureFolder,
      allureResultsFolder: resultsFolder,
      chart: {
        ...chart,
        profile: chart?.profile ?? "default",
        historyPath,
        allureQualityGatePath,
        sonarQualityGatePath,
        testsTablePath,
      },
    },
  };
  return buildSuggestSignals(
    buildAnalytics(summary, results, DEFAULT_TOP_SUITES, historyFromRuns(runs)),
    resolved,
  );
}
