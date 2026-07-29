#!/usr/bin/env node
/**
 * Root test entry: ALLURE_RESULTS_DIR at repo root, then full workspace tests.
 * Usage: node scripts/run-tests.mjs
 */
import { spawnSync } from "node:child_process";
import { ensureAllureResultsDir, REPO_ROOT } from "./allure-env.mjs";

const { ALLURE_RESULTS_DIR } = ensureAllureResultsDir({ clean: true });

const result = spawnSync("pnpm", ["-r", "run", "test"], {
  cwd: REPO_ROOT,
  env: { ...process.env, ALLURE_RESULTS_DIR },
  stdio: "inherit",
});

if (result.error) throw result.error;
console.log(`allure-results → ${ALLURE_RESULTS_DIR}`);

const merge = spawnSync(
  "node",
  ["scripts/merge-allure-suite-meta.mjs", ALLURE_RESULTS_DIR],
  {
    cwd: REPO_ROOT,
    stdio: "inherit",
  },
);
if (merge.error) throw merge.error;
if ((merge.status ?? 1) !== 0) process.exit(merge.status ?? 1);

const gate = spawnSync(
  "node",
  ["scripts/check-allure-labels.mjs", ALLURE_RESULTS_DIR],
  {
    cwd: REPO_ROOT,
    stdio: "inherit",
  },
);
if (gate.error) throw gate.error;
if ((gate.status ?? 1) !== 0) process.exit(gate.status ?? 1);

process.exit(result.status ?? 1);
