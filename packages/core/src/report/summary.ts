/**
 * Allure 3 (and A2-shaped) summary.json → Summary.
 */

import { readFile } from "node:fs/promises";

import type { Statistic, Summary } from "./types.js";

function asInt(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return Math.trunc(n);
    }
  }
  return fallback;
}

function emptyStatistic(): Statistic {
  return {
    passed: 0,
    failed: 0,
    broken: 0,
    skipped: 0,
    unknown: 0,
    total: 0,
  };
}

/**
 * Adapt Allure 3 `summary.json` (`stats` + `duration`) or Allure 2 widgets
 * shape (`statistic` + `time.duration`) into the collage Summary model.
 */
export function adaptSummaryJson(root: unknown): Summary {
  if (!root || typeof root !== "object") {
    return { statistic: emptyStatistic(), durationMs: 0 };
  }
  const obj = root as Record<string, unknown>;

  // Allure 3
  if (obj.stats && typeof obj.stats === "object") {
    const stats = obj.stats as Record<string, unknown>;
    return {
      statistic: {
        passed: asInt(stats.passed),
        failed: asInt(stats.failed),
        broken: asInt(stats.broken),
        skipped: asInt(stats.skipped),
        unknown: asInt(stats.unknown),
        total: asInt(stats.total),
      },
      durationMs: asInt(obj.duration),
    };
  }

  // Allure 2 widgets/summary.json
  if (obj.statistic && typeof obj.statistic === "object") {
    const stats = obj.statistic as Record<string, unknown>;
    const time =
      obj.time && typeof obj.time === "object"
        ? (obj.time as Record<string, unknown>)
        : {};
    return {
      statistic: {
        passed: asInt(stats.passed),
        failed: asInt(stats.failed),
        broken: asInt(stats.broken),
        skipped: asInt(stats.skipped),
        unknown: asInt(stats.unknown),
        total: asInt(stats.total),
      },
      durationMs: asInt(time.duration),
    };
  }

  return { statistic: emptyStatistic(), durationMs: 0 };
}

export async function readSummary(summaryPath: string): Promise<Summary> {
  const raw = await readFile(summaryPath, "utf8");
  return adaptSummaryJson(JSON.parse(raw) as unknown);
}
