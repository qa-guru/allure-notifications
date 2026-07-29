/**
 * History-derived series for collage panels.
 * Port of Java HistoryReader + HistoryAnalytics (Allure 3 history.jsonl).
 *
 * Beyond statusDynamics / successRateDistribution, derives series for
 * statusTransitions, testBaseGrowth, coverageDiff, problems-by-env,
 * durationDynamics, statusAgePyramid, and per-case stability samples.
 */

import { access, readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import type { Config } from "@allure-notifications/config";

import type { AllureLabel } from "./types.js";

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
export const STABILITY_THRESHOLD = 90;

/** Age-pyramid bands (builds), newest-first ages of non-passed cases. */
export const STATUS_AGE_BANDS = [
  { label: "1 build", min: 1, max: 1 },
  { label: "2", min: 2, max: 2 },
  { label: "3–4", min: 3, max: 4 },
  { label: "5–7", min: 5, max: 7 },
  { label: "8+", min: 8, max: Number.POSITIVE_INFINITY },
] as const;

export type HistoryTestResult = {
  id?: string;
  name?: string;
  fullName?: string;
  status?: string;
  duration?: number;
  start?: number;
  stop?: number;
  environment?: string;
  labels?: AllureLabel[];
};

export type HistoryRun = {
  uuid?: string;
  name?: string;
  timestamp?: number;
  testResults?: Record<string, HistoryTestResult>;
};

export type StatusTransitionPoint = {
  fixed: number;
  regressed: number;
  malfunctioned: number;
};

export type GrowthPoint = {
  added: number;
  removed: number;
};

export type CoverageDiffCell = {
  name: string;
  kind: "added" | "removed" | "unchanged";
  count: number;
};

export type ProblemsByEnvironment = {
  environments: string[];
  /** matrix[envIndex][runIndex] = failed+broken count */
  matrix: number[][];
};

export type StatusAgeBucket = {
  label: string;
  failed: number;
  broken: number;
  skipped: number;
  unknown: number;
};

/** Per-case pass tally + labels for stabilityDistribution groupBy. */
export type StabilityCase = {
  id: string;
  labels: Record<string, string>;
  passed: number;
  total: number;
};

export type StabilityBar = {
  name: string;
  rate: number;
};

export type HistoryAnalytics = {
  statusDynamics: Array<Record<string, number>>;
  successRateDistribution: number[];
  runCount: number;
  statusTransitions: StatusTransitionPoint[];
  testBaseGrowth: GrowthPoint[];
  coverageDiff: CoverageDiffCell[];
  problemsByEnvironment: ProblemsByEnvironment;
  durationDynamics: number[];
  statusAgePyramid: StatusAgeBucket[];
  stabilityCases: StabilityCase[];
};

export function isHistoryEmpty(
  history: HistoryAnalytics | null | undefined,
): boolean {
  return history == null || history.runCount === 0;
}

function emptyProblems(): ProblemsByEnvironment {
  return { environments: [], matrix: [] };
}

function emptyAgePyramid(): StatusAgeBucket[] {
  return STATUS_AGE_BANDS.map((band) => ({
    label: band.label,
    failed: 0,
    broken: 0,
    skipped: 0,
    unknown: 0,
  }));
}

/** Fixed bucket snapshot for chart layout tests (no synthetic runs). */
export function historyWithBuckets(
  successRateDistribution: number[],
): HistoryAnalytics {
  return {
    statusDynamics: [],
    successRateDistribution,
    runCount: 1,
    statusTransitions: [],
    testBaseGrowth: [],
    coverageDiff: [],
    problemsByEnvironment: emptyProblems(),
    durationDynamics: [],
    statusAgePyramid: emptyAgePyramid(),
    stabilityCases: [],
  };
}

function normalizeStatus(raw: string | undefined | null): string {
  const status = raw?.trim().toLowerCase() ?? "unknown";
  if (
    status === "passed" ||
    status === "failed" ||
    status === "broken" ||
    status === "skipped" ||
    status === "unknown"
  ) {
    return status;
  }
  return "unknown";
}

function caseIdOf(entryKey: string, result: HistoryTestResult): string {
  return result.id != null && result.id !== "" ? result.id : entryKey;
}

function labelsMap(result: HistoryTestResult): Record<string, string> {
  const out: Record<string, string> = {};
  for (const label of result.labels ?? []) {
    if (label?.name && label.value != null && label.value !== "") {
      // First wins (Allure often repeats host/thread).
      if (out[label.name] == null) {
        out[label.name] = label.value;
      }
    }
  }
  return out;
}

function durationOf(result: HistoryTestResult): number | null {
  if (result.duration != null && result.duration >= 0) {
    return result.duration;
  }
  if (result.start != null && result.stop != null && result.stop >= result.start) {
    return result.stop - result.start;
  }
  return null;
}

function groupLabelOf(labels: Record<string, string>): string {
  return (
    labels.feature ||
    labels.suite ||
    labels.parentSuite ||
    labels.epic ||
    labels.story ||
    labels.component ||
    "other"
  );
}

/**
 * Parse catalog groupBy: `feature` | `epic` | `story` | `label-name:component`.
 */
export function resolveGroupByLabel(groupBy: string | undefined | null): string {
  if (!groupBy || !groupBy.trim()) {
    return "feature";
  }
  const raw = groupBy.trim();
  const lower = raw.toLowerCase();
  if (lower.startsWith("label-name:")) {
    const name = raw.slice("label-name:".length).trim();
    return name || "feature";
  }
  return raw;
}

/**
 * Aggregate stability % bars for a groupBy label from per-case tallies.
 * Skips cases with total=0; rate = passed/total * 100.
 */
export function stabilityBarsFromCases(
  cases: StabilityCase[] | null | undefined,
  groupBy: string | undefined | null,
  topN = 12,
): StabilityBar[] {
  const labelName = resolveGroupByLabel(groupBy);
  const buckets = new Map<string, { passed: number; total: number }>();
  for (const row of cases ?? []) {
    const key = row.labels[labelName]?.trim();
    if (!key) continue;
    if (row.total <= 0) continue;
    const bucket = buckets.get(key) ?? { passed: 0, total: 0 };
    bucket.passed += row.passed;
    bucket.total += row.total;
    buckets.set(key, bucket);
  }
  const bars: StabilityBar[] = [];
  for (const [name, tally] of buckets) {
    // Buckets only accept rows with total > 0 above — tally.total is always > 0.
    bars.push({
      name,
      rate: Math.round((tally.passed / tally.total) * 1000) / 10,
    });
  }
  bars.sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name));
  return bars.slice(0, Math.max(0, topN));
}

function buildStatusTransitions(
  runMaps: Array<Map<string, string>>,
): StatusTransitionPoint[] {
  const out: StatusTransitionPoint[] = [];
  for (let i = 1; i < runMaps.length; i++) {
    const prev = runMaps[i - 1]!;
    const curr = runMaps[i]!;
    let fixed = 0;
    let regressed = 0;
    let malfunctioned = 0;
    for (const [id, status] of curr) {
      const before = prev.get(id);
      if (before == null) continue;
      const badBefore = before === "failed" || before === "broken";
      if (badBefore && status === "passed") {
        fixed++;
      } else if (before === "passed" && status === "failed") {
        regressed++;
      } else if (before === "passed" && status === "broken") {
        malfunctioned++;
      }
    }
    out.push({ fixed, regressed, malfunctioned });
  }
  return out;
}

function buildTestBaseGrowth(
  runIds: Array<Set<string>>,
): GrowthPoint[] {
  const out: GrowthPoint[] = [];
  for (let i = 1; i < runIds.length; i++) {
    const prev = runIds[i - 1]!;
    const curr = runIds[i]!;
    let added = 0;
    let removed = 0;
    for (const id of curr) {
      if (!prev.has(id)) added++;
    }
    for (const id of prev) {
      if (!curr.has(id)) removed++;
    }
    out.push({ added, removed });
  }
  return out;
}

function buildCoverageDiff(
  older: Map<string, { labels: Record<string, string> }> | undefined,
  newer: Map<string, { labels: Record<string, string> }> | undefined,
): CoverageDiffCell[] {
  if (!older || !newer || older.size === 0 || newer.size === 0) {
    return [];
  }
  type Acc = { added: number; removed: number; unchanged: number };
  const groups = new Map<string, Acc>();
  const ensure = (name: string): Acc => {
    let acc = groups.get(name);
    if (!acc) {
      acc = { added: 0, removed: 0, unchanged: 0 };
      groups.set(name, acc);
    }
    return acc;
  };

  for (const [id, meta] of newer) {
    const name = groupLabelOf(meta.labels);
    const acc = ensure(name);
    if (older.has(id)) {
      acc.unchanged++;
    } else {
      acc.added++;
    }
  }
  for (const [id, meta] of older) {
    if (!newer.has(id)) {
      ensure(groupLabelOf(meta.labels)).removed++;
    }
  }

  const cells: CoverageDiffCell[] = [];
  for (const [name, acc] of groups) {
    if (acc.added > 0 && acc.removed === 0 && acc.unchanged === 0) {
      cells.push({ name, kind: "added", count: acc.added });
    } else if (acc.removed > 0 && acc.added === 0 && acc.unchanged === 0) {
      cells.push({ name, kind: "removed", count: acc.removed });
    } else {
      const count = acc.unchanged + acc.added + acc.removed;
      if (count > 0) {
        cells.push({ name, kind: "unchanged", count });
      }
    }
  }
  cells.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return cells.slice(0, 24);
}

function buildProblemsByEnvironment(
  runs: HistoryRun[],
): ProblemsByEnvironment {
  const envSet = new Set<string>();
  const perRun = runs.map((run) => {
    const counts = new Map<string, number>();
    for (const result of Object.values(run.testResults ?? {})) {
      if (result == null) continue;
      const status = normalizeStatus(result.status);
      if (status !== "failed" && status !== "broken") continue;
      const env =
        result.environment?.trim() ||
        labelsMap(result).environment?.trim() ||
        "";
      if (!env) continue;
      envSet.add(env);
      counts.set(env, (counts.get(env) ?? 0) + 1);
    }
    return counts;
  });

  const environments = [...envSet].sort((a, b) => a.localeCompare(b));
  if (environments.length === 0) {
    return emptyProblems();
  }
  const matrix = environments.map((env) =>
    perRun.map((counts) => counts.get(env) ?? 0),
  );
  return { environments, matrix };
}

function buildDurationDynamics(runs: HistoryRun[]): number[] {
  const out: number[] = [];
  for (const run of runs) {
    let sum = 0;
    let n = 0;
    for (const result of Object.values(run.testResults ?? {})) {
      if (result == null) continue;
      const d = durationOf(result);
      if (d == null) continue;
      sum += d;
      n++;
    }
    if (n > 0) {
      out.push(sum / n);
    }
  }
  // Only keep series when at least one run had durations.
  return out.length > 0 ? out : [];
}

function buildStatusAgePyramid(
  runMaps: Array<Map<string, string>>,
): StatusAgeBucket[] {
  const buckets = emptyAgePyramid();
  if (runMaps.length === 0) return buckets;

  const latest = runMaps[runMaps.length - 1]!;
  for (const [id, latestStatus] of latest) {
    // normalizeStatus → STATUS_KEYS only; age pyramid tracks non-passed.
    if (
      latestStatus !== "failed" &&
      latestStatus !== "broken" &&
      latestStatus !== "skipped" &&
      latestStatus !== "unknown"
    ) {
      continue;
    }
    let age = 0;
    for (let i = runMaps.length - 1; i >= 0; i--) {
      const status = runMaps[i]!.get(id);
      if (status == null || status === "passed") break;
      if (status !== latestStatus) break;
      age++;
    }
    // age >= 1 here: latest non-passed status always increments once before break.
    // STATUS_AGE_BANDS covers 1…∞ so find always matches.
    const band = STATUS_AGE_BANDS.find((b) => age >= b.min && age <= b.max)!;
    const bucket = buckets.find((b) => b.label === band.label)!;
    bucket[latestStatus] += 1;
  }
  return buckets;
}

export function historyFromRuns(runs: HistoryRun[] | null | undefined): HistoryAnalytics {
  const dynamics: Array<Record<string, number>> = [];
  const perCase = new Map<string, [passed: number, total: number]>();
  const stability = new Map<
    string,
    { labels: Record<string, string>; passed: number; total: number }
  >();
  const runMaps: Array<Map<string, string>> = [];
  const runIds: Array<Set<string>> = [];
  const runMeta: Array<Map<string, { labels: Record<string, string> }>> = [];

  if (runs) {
    for (const run of runs) {
      const counts: Record<string, number> = {};
      for (const key of STATUS_KEYS) {
        counts[key] = 0;
      }
      const statusMap = new Map<string, string>();
      const idSet = new Set<string>();
      const metaMap = new Map<string, { labels: Record<string, string> }>();
      const results = run.testResults ?? {};
      for (const [entryKey, result] of Object.entries(results)) {
        if (result == null) {
          continue;
        }
        const status = normalizeStatus(result.status);
        counts[status]! += 1;

        const caseId = caseIdOf(entryKey, result);
        statusMap.set(caseId, status);
        idSet.add(caseId);
        const labels = labelsMap(result);
        metaMap.set(caseId, { labels });

        let tally = perCase.get(caseId);
        if (!tally) {
          tally = [0, 0];
          perCase.set(caseId, tally);
        }
        tally[1]++;
        if (status === "passed") {
          tally[0]++;
        }

        // Stability: skip skipped/unknown (Allure skipStatuses default).
        if (status !== "skipped" && status !== "unknown") {
          let stab = stability.get(caseId);
          if (!stab) {
            stab = { labels, passed: 0, total: 0 };
            stability.set(caseId, stab);
          } else if (Object.keys(labels).length > 0) {
            // Prefer richer labels when available.
            stab.labels = { ...stab.labels, ...labels };
          }
          stab.total++;
          if (status === "passed") {
            stab.passed++;
          }
        }
      }
      dynamics.push(counts);
      runMaps.push(statusMap);
      runIds.push(idSet);
      runMeta.push(metaMap);
    }
  }

  const buckets = new Array<number>(SUCCESS_BUCKETS).fill(0);
  for (const [passed, total] of perCase.values()) {
    // perCase only records cases seen in at least one run → total >= 1; rate ∈ [0, 1].
    const rate = passed / total;
    let index = Math.floor(rate * SUCCESS_BUCKETS);
    if (index >= SUCCESS_BUCKETS) index = SUCCESS_BUCKETS - 1;
    buckets[index]! += 1;
  }

  const stabilityCases: StabilityCase[] = [];
  for (const [id, row] of stability) {
    stabilityCases.push({
      id,
      labels: row.labels,
      passed: row.passed,
      total: row.total,
    });
  }

  const older = runMeta.length >= 2 ? runMeta[runMeta.length - 2] : undefined;
  const newer = runMeta.length >= 1 ? runMeta[runMeta.length - 1] : undefined;

  return {
    statusDynamics: dynamics,
    successRateDistribution: buckets,
    runCount: dynamics.length,
    statusTransitions: buildStatusTransitions(runMaps),
    testBaseGrowth: buildTestBaseGrowth(runIds),
    coverageDiff: buildCoverageDiff(older, newer),
    problemsByEnvironment: buildProblemsByEnvironment(runs ?? []),
    durationDynamics: buildDurationDynamics(runs ?? []),
    statusAgePyramid: buildStatusAgePyramid(runMaps),
    stabilityCases,
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
        runs.push(normalizeRun(run));
      }
    } catch {
      /* skip invalid line */
    }
  }

  runs.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  if (limit > 0 && runs.length > limit) {
    return runs.slice(runs.length - limit);
  }
  return runs;
}

function asLabels(raw: unknown): AllureLabel[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: AllureLabel[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.name === "string" && typeof row.value === "string") {
      out.push({ name: row.name, value: row.value });
    }
  }
  return out.length > 0 ? out : undefined;
}

function normalizeRun(run: HistoryRun): HistoryRun {
  const results = run.testResults;
  if (!results || typeof results !== "object") {
    return run;
  }
  const normalized: Record<string, HistoryTestResult> = {};
  for (const [key, raw] of Object.entries(results)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as HistoryTestResult & Record<string, unknown>;
    normalized[key] = {
      id: typeof r.id === "string" ? r.id : undefined,
      name: typeof r.name === "string" ? r.name : undefined,
      fullName: typeof r.fullName === "string" ? r.fullName : undefined,
      status: typeof r.status === "string" ? r.status : undefined,
      duration: typeof r.duration === "number" ? r.duration : undefined,
      start: typeof r.start === "number" ? r.start : undefined,
      stop: typeof r.stop === "number" ? r.stop : undefined,
      environment:
        typeof r.environment === "string" ? r.environment : undefined,
      labels: asLabels(r.labels),
    };
  }
  return { ...run, testResults: normalized };
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
