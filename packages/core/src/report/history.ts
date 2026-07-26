/**
 * History-derived series for statusDynamics / successRateDistribution.
 * Port of Java HistoryReader + HistoryAnalytics (Allure 3 history.jsonl).
 */

import { access, readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import type { Config } from "@allure-notifications/config";

/** Ordered status keys shared by history panels (bottom-to-top in stacked bars). */
export const STATUS_KEYS = [
  "passed",
  "failed",
  "broken",
  "skipped",
  "unknown",
] as const;

export const SUCCESS_BUCKETS = 10;
export const DEFAULT_HISTORY_LIMIT = 20;
export const DEFAULT_HISTORY_FILE = "history.jsonl";

export type HistoryTestResult = {
  id?: string;
  name?: string;
  status?: string;
};

export type HistoryRun = {
  uuid?: string;
  name?: string;
  timestamp?: number;
  testResults?: Record<string, HistoryTestResult>;
};

export type HistoryAnalytics = {
  statusDynamics: Array<Record<string, number>>;
  successRateDistribution: number[];
  runCount: number;
};

export function isHistoryEmpty(
  history: HistoryAnalytics | null | undefined,
): boolean {
  return history == null || history.runCount === 0;
}

/** Fixed bucket snapshot for chart layout tests (no synthetic runs). */
export function historyWithBuckets(
  successRateDistribution: number[],
): HistoryAnalytics {
  return {
    statusDynamics: [],
    successRateDistribution,
    runCount: 1,
  };
}

export function historyFromRuns(runs: HistoryRun[] | null | undefined): HistoryAnalytics {
  const dynamics: Array<Record<string, number>> = [];
  const perCase = new Map<string, [passed: number, total: number]>();

  if (runs) {
    for (const run of runs) {
      const counts: Record<string, number> = {};
      for (const key of STATUS_KEYS) {
        counts[key] = 0;
      }
      const results = run.testResults ?? {};
      for (const [entryKey, result] of Object.entries(results)) {
        if (result == null) {
          continue;
        }
        let status = result.status?.trim().toLowerCase() ?? "unknown";
        if (!(status in counts)) {
          status = "unknown";
        }
        counts[status] = (counts[status] ?? 0) + 1;

        const caseId = result.id != null ? result.id : entryKey;
        let tally = perCase.get(caseId);
        if (!tally) {
          tally = [0, 0];
          perCase.set(caseId, tally);
        }
        tally[1]++;
        if (status === "passed") {
          tally[0]++;
        }
      }
      dynamics.push(counts);
    }
  }

  const buckets = new Array<number>(SUCCESS_BUCKETS).fill(0);
  for (const [passed, total] of perCase.values()) {
    if (total === 0) {
      continue;
    }
    const rate = passed / total;
    let index = Math.floor(rate * SUCCESS_BUCKETS);
    if (index >= SUCCESS_BUCKETS) index = SUCCESS_BUCKETS - 1;
    if (index < 0) index = 0;
    buckets[index] = (buckets[index] ?? 0) + 1;
  }

  return {
    statusDynamics: dynamics,
    successRateDistribution: buckets,
    runCount: dynamics.length,
  };
}

/**
 * Reads history.jsonl — at most `limit` most recent runs, oldest-to-newest.
 * Missing/invalid files → empty list; invalid lines skipped.
 */
export async function readHistoryFile(
  historyFile: string,
  limit = DEFAULT_HISTORY_LIMIT,
): Promise<HistoryRun[]> {
  let text: string;
  try {
    text = await readFile(historyFile, "utf8");
  } catch {
    return [];
  }

  const runs: HistoryRun[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const run = JSON.parse(trimmed) as HistoryRun;
      if (run && typeof run === "object") {
        runs.push(run);
      }
    } catch {
      /* skip invalid line */
    }
  }

  runs.sort(
    (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
  );
  if (limit > 0 && runs.length > limit) {
    return runs.slice(runs.length - limit);
  }
  return runs;
}

async function isRegularFile(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function addDirAndParent(dirs: string[], dir: string | null | undefined): void {
  if (!dir) return;
  const normalized = resolve(dir);
  if (!dirs.includes(normalized)) {
    dirs.push(normalized);
  }
  const parent = resolve(normalized, "..");
  if (parent !== normalized && !dirs.includes(parent)) {
    dirs.push(parent);
  }
}

async function resolveConfiguredHistoryFile(
  configuredPath: string,
  allureFolder: string | undefined,
): Promise<string> {
  if (isAbsolute(configuredPath)) {
    return configuredPath;
  }
  const fromCwd = resolve(configuredPath);
  if (await isRegularFile(fromCwd)) {
    return fromCwd;
  }
  if (allureFolder) {
    const report = resolve(allureFolder);
    const candidate = resolve(report, configuredPath);
    if (await isRegularFile(candidate)) {
      return candidate;
    }
    const parentCandidate = resolve(report, "..", configuredPath);
    if (await isRegularFile(parentCandidate)) {
      return parentCandidate;
    }
  }
  return fromCwd;
}

/**
 * Resolve history.jsonl: chart.historyPath wins; else auto-discover next to
 * report / results (and parents), then cwd — Java ReportAnalyticsBuilder parity.
 */
export async function resolveHistoryFile(
  config: Config,
  allureFolder: string,
  resultsFolder: string | null,
): Promise<string | null> {
  const configured = config.base.chart?.historyPath?.trim();
  if (configured) {
    return resolveConfiguredHistoryFile(configured, allureFolder);
  }

  const dirs: string[] = [];
  addDirAndParent(dirs, allureFolder);
  addDirAndParent(dirs, resultsFolder);
  addDirAndParent(dirs, process.cwd());

  for (const dir of dirs) {
    const candidate = join(dir, DEFAULT_HISTORY_FILE);
    if (await isRegularFile(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function loadHistoryAnalytics(
  config: Config,
  allureFolder: string,
  resultsFolder: string | null,
): Promise<HistoryAnalytics | null> {
  const historyFile = await resolveHistoryFile(
    config,
    allureFolder,
    resultsFolder,
  );
  if (!historyFile || !(await isRegularFile(historyFile))) {
    return null;
  }
  const limit =
    config.base.chart?.historyLimit != null && config.base.chart.historyLimit > 0
      ? config.base.chart.historyLimit
      : DEFAULT_HISTORY_LIMIT;
  const runs = await readHistoryFile(historyFile, limit);
  return historyFromRuns(runs);
}
