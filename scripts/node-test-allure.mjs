#!/usr/bin/env node
/**
 * SSOT node:test runner with allure-node-test reporter (Node 24 reporter-only).
 * Suite labels applied post-run via scripts/merge-allure-suite-meta.mjs.
 * Usage: node scripts/node-test-allure.mjs [test files/globs...]
 */
import { spawnSync } from "node:child_process";

const testArgs = process.argv.slice(2);
if (testArgs.length === 0) {
  console.error("node-test-allure: pass at least one test file or glob");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "--test",
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "--test-reporter=allure-node-test/reporter",
    "--test-reporter-destination=stdout",
    ...testArgs,
  ],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
