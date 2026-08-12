#!/usr/bin/env node
/**
 * Coverage gate (hard 100% × 4 metrics):
 * 1. Packages — c8 on packages/{config,core,cli,plugin}/src
 * 2. Builder — istanbul via Playwright (`scripts/builder-coverage.mjs`)
 *    on apps/builder/js/{app,phrases}.js (SSOT: src/app.ts + src/phrases.ts).
 *
 * Visual/collage pixel gate stays in `pnpm test` — not mixed with % floor.
 * Writes Allure sidecar to .coverage-allure-tmp so it does not pollute
 * the primary allure-results/ from `pnpm test`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { REPO_ROOT } from "./allure-env.mjs";
import fs from "node:fs";

const scratch = path.join(REPO_ROOT, ".coverage-allure-tmp");
fs.mkdirSync(scratch, { recursive: true });

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

const packagesStatus = run(
  "pnpm",
  [
    "exec",
    "c8",
    "--config",
    path.join(REPO_ROOT, "c8.config.json"),
    "pnpm",
    "--filter",
    "@qa-guru/allure-notifications-config",
    "--filter",
    "@qa-guru/allure-notifications-core",
    "--filter",
    "allure-notifications",
    "--filter",
    "@qa-guru/allure-notifications-plugin",
    "--filter",
    "@qa-guru/allure-notifications-test-meta",
    "run",
    "test",
  ],
  { ALLURE_RESULTS_DIR: scratch },
);

if (packagesStatus !== 0) process.exit(packagesStatus);

const builderStatus = run("node", [
  path.join(REPO_ROOT, "scripts/builder-coverage.mjs"),
]);
process.exit(builderStatus);
