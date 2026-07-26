/**
 * Resolve ALLURE_RESULTS_DIR to the nested-repo root (never package cwd).
 * Product dogfood fixtures under packages/core/test/fixtures/ are unrelated.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function ensureAllureResultsDir({ clean = false } = {}) {
  const dir =
    process.env.ALLURE_RESULTS_DIR || path.join(REPO_ROOT, "allure-results");
  process.env.ALLURE_RESULTS_DIR = dir;
  fs.mkdirSync(dir, { recursive: true });
  if (clean) {
    for (const name of fs.readdirSync(dir)) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  }
  return { REPO_ROOT, ALLURE_RESULTS_DIR: dir };
}
