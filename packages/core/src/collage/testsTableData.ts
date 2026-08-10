/**
 * Tests-table collage data loader.
 *
 * Explicit `chart.testsTablePath` or report widget
 * `widgets/kit-panels/testsTable.json`.
 */

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  isKitOnlyChartItem,
  normalizeChartProfile,
  shouldSilentSkipKitOnlyItem,
  type ChartItem,
  type Config,
} from "@qa-guru/allure-notifications-config";
import type {
  KitTestsTableData,
  KitTestsTableHistoryPoint,
  KitTestsTableRow,
} from "@qa-guru/allure-report-kit";

export class TestsTableDataMissingError extends Error {
  constructor(public readonly path?: string) {
    const where = path ? ` (tried ${path})` : "";
    super(
      `tests table data missing${where}; ` +
        `set chart.testsTablePath ` +
        `or ensure report widgets/kit-panels/testsTable.json exists`,
    );
    this.name = "TestsTableDataMissingError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHistoryPoint(value: unknown): value is KitTestsTableHistoryPoint {
  if (!isPlainObject(value)) {
    return false;
  }
  if (value.status !== undefined && typeof value.status !== "string") {
    return false;
  }
  if (value.durationSec !== undefined && typeof value.durationSec !== "number") {
    return false;
  }
  return true;
}

function isTestsTableRow(value: unknown): value is KitTestsTableRow {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.name !== "string") {
    return false;
  }
  if (typeof value.status !== "string") {
    return false;
  }
  if (value.history !== undefined) {
    if (!Array.isArray(value.history) || !value.history.every(isHistoryPoint)) {
      return false;
    }
  }
  if (value.flakyFlips !== undefined && typeof value.flakyFlips !== "number") {
    return false;
  }
  return true;
}

export function isKitTestsTableData(value: unknown): value is KitTestsTableData {
  if (!isPlainObject(value)) {
    return false;
  }
  if (!Array.isArray(value.rows)) {
    return false;
  }
  if (!value.rows.every(isTestsTableRow)) {
    return false;
  }
  if (value.lang !== undefined && value.lang !== "ru" && value.lang !== "en") {
    return false;
  }
  if (value.columns !== undefined) {
    if (!Array.isArray(value.columns) || !value.columns.every((c) => typeof c === "string")) {
      return false;
    }
  }
  return true;
}

/** Parse unknown JSON into {@link KitTestsTableData}. */
export function parseKitTestsTableData(value: unknown): KitTestsTableData {
  if (!isKitTestsTableData(value)) {
    throw new TypeError(
      "allure-report-kit: value is not KitTestsTableData (need rows[] with name + status)",
    );
  }
  return value;
}

function testsTableItems(config: Config): ChartItem[] {
  const chart = config.base.chart;
  const profile = normalizeChartProfile(chart?.profile);
  const items = chart?.items ?? [];
  return items.filter(
    (item) =>
      isTestsTableChartItem(item) && !shouldSilentSkipKitOnlyItem(profile, item),
  );
}

export function isTestsTableChartItem(
  item: Partial<ChartItem> & { id?: string },
): boolean {
  return item.type?.trim() === "testsTable" || item.id === "testsTable";
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`invalid JSON in ${path}: ${msg}`);
  }
}

async function readFirstTestsTableJson(paths: string[]): Promise<KitTestsTableData> {
  for (const path of paths) {
    if (!(await fileExists(path))) {
      continue;
    }
    const data = await readJsonFile(path);
    return parseKitTestsTableData(data);
  }
  throw new TestsTableDataMissingError(paths.join(" | "));
}

async function loadTestsTableData(config: Config): Promise<KitTestsTableData> {
  const chart = config.base.chart;
  const allureFolder = config.base.allureFolder ?? "allure-report/";
  const explicit = chart?.testsTablePath?.trim();
  const candidates = explicit
    ? [explicit]
    : [join(allureFolder, "widgets/kit-panels/testsTable.json")];
  return readFirstTestsTableJson(candidates);
}

/**
 * Load kit tests-table payload when collage will render (`profile === "kit"`).
 * Returns `undefined` when no active testsTable tile (default profile silent-skip).
 */
export async function loadTestsTableCollageData(
  config: Config,
): Promise<KitTestsTableData | undefined> {
  const items = testsTableItems(config);
  if (items.length === 0) {
    return undefined;
  }
  return loadTestsTableData(config);
}
