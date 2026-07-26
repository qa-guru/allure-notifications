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
process.exit(result.status ?? 1);
