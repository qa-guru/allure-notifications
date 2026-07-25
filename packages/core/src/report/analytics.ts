/**
 * Build ReportAnalytics from summary + allure-results.
 */

import { isKnownLayer } from "@allure-notifications/pyramid";
import { access } from "node:fs/promises";
import { join } from "node:path";

import type { Config } from "@allure-notifications/config";

import {
  durationMsOf,
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

const DEFAULT_TOP_SUITES = 10;

export function buildAnalytics(
  summary: Summary,
  results: AllureTestResult[],
  topSuites = DEFAULT_TOP_SUITES,
): ReportAnalytics {
  const statistic: Statistic = { ...summary.statistic };
  const layerCounts: Record<string, number> = {};
  const suiteCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  const durations: number[] = [];
  const durationsByLayer: Record<string, number[]> = {};
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
  }

  const suites: SuiteStat[] = Object.entries(suiteCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(topSuites, 0))
    .map(([name, count]) => ({ name, count }));

  durations.sort((a, b) => a - b);

  return {
    statistic,
    layers: layerCounts,
    suites,
    durationsMs: durations,
    durationsMsByLayer: durationsByLayer,
    severities: severityCounts,
    hasLayerLabels,
    hasKnownLayerLabels,
    resultCount: results.length,
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
  return buildAnalytics(summary, results);
}
