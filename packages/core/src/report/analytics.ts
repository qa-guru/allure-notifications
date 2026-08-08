/**
 * Build ReportAnalytics from summary + allure-results (+ optional history).
 */

import { isKnownLayer } from "@qa-guru/allure-notifications-pyramid";
import { access } from "node:fs/promises";
import { join } from "node:path";

import type { Config } from "@qa-guru/allure-notifications-config";

import {
  loadHistoryAnalytics,
  type HistoryAnalytics,
  type StabilityCase,
} from "./history.js";
import {
  durationMsOf,
  labelOf,
  layerOf,
  readAllureResults,
  resolveResultsFolder,
  severityOf,
  suiteNameOf,
} from "./results.js";
import { readSummary } from "./summary.js";
import type {
  AllureTestResult,
  ReportAnalytics,
  Statistic,
  SuiteStat,
  Summary,
} from "./types.js";

export const DEFAULT_TOP_SUITES = 10;

export function buildAnalytics(
  summary: Summary,
  results: AllureTestResult[],
  topSuites = DEFAULT_TOP_SUITES,
  history: HistoryAnalytics | null = null,
): ReportAnalytics {
  const statistic: Statistic = { ...summary.statistic };
  const layerCounts: Record<string, number> = {};
  const suiteCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  const durations: number[] = [];
  const durationsByLayer: Record<string, number[]> = {};
  const stabilityCases: StabilityCase[] = [];
  let hasLayerLabels = false;
  let hasKnownLayerLabels = false;

  for (const result of results) {
    const layer = layerOf(result);
    let layerKey: string | null = null;
    if (layer && layer.trim()) {
      hasLayerLabels = true;
      layerKey = layer.trim().toLowerCase();
      if (isKnownLayer(layerKey)) {
        hasKnownLayerLabels = true;
      }
      layerCounts[layerKey] = (layerCounts[layerKey] ?? 0) + 1;
    }

    const severity = severityOf(result);
    if (severity && severity.trim()) {
      const key = severity.trim().toLowerCase();
      severityCounts[key] = (severityCounts[key] ?? 0) + 1;
    }

    const suite = suiteNameOf(result);
    if (suite && suite.trim()) {
      suiteCounts[suite] = (suiteCounts[suite] ?? 0) + 1;
    }

    const duration = durationMsOf(result);
    if (duration != null && duration >= 0) {
      durations.push(duration);
      if (layerKey) {
        const bucket = durationsByLayer[layerKey] ?? [];
        bucket.push(duration);
        durationsByLayer[layerKey] = bucket;
      }
    }

    const status = (result.status ?? "unknown").trim().toLowerCase();
    if (status !== "skipped" && status !== "unknown") {
      const labels: Record<string, string> = {};
      for (const label of result.labels) {
        if (label.name && label.value && labels[label.name] == null) {
          labels[label.name] = label.value;
        }
      }
      // Ensure common Allure labels are present even if only via helpers.
      const feature = labelOf(result, "feature");
      const epic = labelOf(result, "epic");
      const story = labelOf(result, "story");
      const component = labelOf(result, "component");
      if (feature) labels.feature = feature;
      if (epic) labels.epic = epic;
      if (story) labels.story = story;
      if (component) labels.component = component;

      stabilityCases.push({
        id: result.uuid ?? result.fullName ?? result.name ?? `r-${stabilityCases.length}`,
        labels,
        passed: status === "passed" ? 1 : 0,
        total: 1,
      });
    }
  }

  const suites: SuiteStat[] = Object.entries(suiteCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(topSuites, 0))
    .map(([name, count]) => ({ name, count }));

  durations.sort((a, b) => a - b);

  return {
    statistic,
    durationMs: summary.durationMs ?? 0,
    layers: layerCounts,
    suites,
    durationsMs: durations,
    durationsMsByLayer: durationsByLayer,
    severities: severityCounts,
    hasLayerLabels,
    hasKnownLayerLabels,
    resultCount: results.length,
    history,
    stabilityCases,
  };
}

async function resolveSummaryPath(allureFolder: string): Promise<string> {
  const candidates = [
    join(allureFolder, "summary.json"),
    join(allureFolder, "widgets", "summary.json"),
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  return candidates[0]!;
}

/**
 * Load summary + results from paths in `config.base` and build analytics.
 */
export async function loadReportAnalytics(
  config: Config,
): Promise<ReportAnalytics> {
  const allureFolder = config.base.allureFolder ?? "allure-report/";
  const summaryPath = await resolveSummaryPath(allureFolder);
  const summary = await readSummary(summaryPath);
  const resultsFolder = await resolveResultsFolder(
    config.base.allureResultsFolder,
    allureFolder,
  );
  const results = await readAllureResults(resultsFolder);
  const history = await loadHistoryAnalytics(
    config,
    allureFolder,
    resultsFolder,
  );
  return buildAnalytics(summary, results, DEFAULT_TOP_SUITES, history);
}
