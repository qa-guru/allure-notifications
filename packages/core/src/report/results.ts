/**
 * Read Allure `*-result.json` files from an allure-results folder.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import type { AllureLabel, AllureTestResult } from "./types.js";

const RESULT_SUFFIX = "-result.json";
const MAX_WALK_DEPTH = 8;

function asLabels(raw: unknown): AllureLabel[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: AllureLabel[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    if (typeof row.name === "string" && typeof row.value === "string") {
      out.push({ name: row.name, value: row.value });
    }
  }
  return out;
}

export function parseTestResult(raw: unknown): AllureTestResult | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  return {
    uuid: typeof obj.uuid === "string" ? obj.uuid : undefined,
    name: typeof obj.name === "string" ? obj.name : undefined,
    fullName: typeof obj.fullName === "string" ? obj.fullName : undefined,
    status: typeof obj.status === "string" ? obj.status : undefined,
    start: typeof obj.start === "number" ? obj.start : undefined,
    stop: typeof obj.stop === "number" ? obj.stop : undefined,
    labels: asLabels(obj.labels),
  };
}

export function labelOf(result: AllureTestResult, name: string): string | null {
  for (const label of result.labels) {
    if (label.name === name) {
      return label.value;
    }
  }
  return null;
}

export function layerOf(result: AllureTestResult): string | null {
  return labelOf(result, "layer");
}

export function severityOf(result: AllureTestResult): string | null {
  return labelOf(result, "severity");
}

export function suiteNameOf(result: AllureTestResult): string | null {
  return (
    labelOf(result, "parentSuite") ||
    labelOf(result, "suite") ||
    labelOf(result, "subSuite") ||
    result.fullName ||
    result.name ||
    null
  );
}

export function durationMsOf(result: AllureTestResult): number | null {
  if (result.start == null || result.stop == null) {
    return null;
  }
  return result.stop - result.start;
}

async function walkResultFiles(
  dir: string,
  depth: number,
  out: string[],
): Promise<void> {
  if (depth > MAX_WALK_DEPTH) {
    return;
  }
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkResultFiles(full, depth + 1, out);
    } else if (entry.isFile() && entry.name.endsWith(RESULT_SUFFIX)) {
      out.push(full);
    }
  }
}

/**
 * Resolve results directory: explicit path, or sibling / nested `allure-results`
 * next to the report folder (mirrors Java AllureResultsReader).
 */
export async function resolveResultsFolder(
  allureResultsFolder: string | undefined,
  allureFolder: string | undefined,
): Promise<string | null> {
  if (allureResultsFolder && allureResultsFolder.trim()) {
    return allureResultsFolder.trim();
  }
  if (!allureFolder) {
    return null;
  }
  const report = allureFolder;
  const parent = join(report, "..");
  const sibling = join(parent, "allure-results");
  try {
    if ((await stat(sibling)).isDirectory()) {
      return sibling;
    }
  } catch {
    /* continue */
  }
  const nested = join(report, "allure-results");
  try {
    if ((await stat(nested)).isDirectory()) {
      return nested;
    }
  } catch {
    /* continue */
  }
  return sibling;
}

export async function readAllureResults(
  resultsFolder: string | null,
): Promise<AllureTestResult[]> {
  if (!resultsFolder) {
    return [];
  }
  try {
    if (!(await stat(resultsFolder)).isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const files: string[] = [];
  await walkResultFiles(resultsFolder, 0, files);
  files.sort();

  const results: AllureTestResult[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
      const parsed = parseTestResult(raw);
      if (parsed) {
        results.push(parsed);
      }
    } catch {
      /* skip invalid */
    }
  }
  return results;
}
