#!/usr/bin/env node
/**
 * Soft coverage for packages only (Q1). Does not fail on % thresholds.
 * Writes Allure sidecar to .coverage-allure-tmp so it does not pollute
 * the primary allure-results/ from `pnpm test`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { REPO_ROOT } from "./allure-env.mjs";
import fs from "node:fs";

const scratch = path.join(REPO_ROOT, ".coverage-allure-tmp");
fs.mkdirSync(scratch, { recursive: true });

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "c8",
    "--config",
    path.join(REPO_ROOT, "c8.config.json"),
    "pnpm",
    "--filter",
    "@allure-notifications/config",
    "--filter",
    "@allure-notifications/pyramid",
    "--filter",
    "@allure-notifications/core",
    "--filter",
    "allure-notifications",
    "run",
    "test",
  ],
  {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      ALLURE_RESULTS_DIR: scratch,
    },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
