#!/usr/bin/env node
/**
 * Builder coverage gate: Playwright e2e with istanbul-instrumented ES modules
 * (apps/builder/js/{app,phrases}.js). Hard-fail below 100% on all four metrics.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { REPO_ROOT } from "./allure-env.mjs";

const require = createRequire(import.meta.url);
const builderRoot = path.join(REPO_ROOT, "apps/builder");
const outDir = path.join(REPO_ROOT, "coverage/builder");
const mapPath = path.join(outDir, "istanbul-map.json");

fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(mapPath)) fs.unlinkSync(mapPath);

const result = spawnSync("pnpm", ["exec", "playwright", "test"], {
  cwd: builderRoot,
  env: {
    ...process.env,
    CI: process.env.CI || "true",
    PLAYWRIGHT_HEADLESS: "1",
    ANB_COVERAGE: "1",
    ANB_COVERAGE_OUT: mapPath,
  },
  stdio: "inherit",
});

if (result.error) throw result.error;
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);

if (!fs.existsSync(mapPath)) {
  console.error(`builder coverage: missing ${mapPath}`);
  process.exit(1);
}

const libCoverage = require("istanbul-lib-coverage");
const libReport = require("istanbul-lib-report");
const reports = require("istanbul-reports");

const map = libCoverage.createCoverageMap(
  JSON.parse(fs.readFileSync(mapPath, "utf8")),
);

// Keep only builder runtime SSOT files.
const filtered = libCoverage.createCoverageMap({});
for (const file of map.files()) {
  if (file.endsWith(`${path.sep}js${path.sep}app.js`) || file.endsWith("/js/app.js")) {
    filtered.addFileCoverage(map.fileCoverageFor(file));
  }
  if (
    file.endsWith(`${path.sep}js${path.sep}phrases.js`) ||
    file.endsWith("/js/phrases.js")
  ) {
    filtered.addFileCoverage(map.fileCoverageFor(file));
  }
}

const context = libReport.createContext({
  dir: outDir,
  coverageMap: filtered,
});
reports.create("lcovonly", { file: "lcov.info" }).execute(context);
reports.create("text").execute(context);

const summary = filtered.getCoverageSummary();
const metrics = {
  lines: summary.lines.pct,
  statements: summary.statements.pct,
  branches: summary.branches.pct,
  functions: summary.functions.pct,
};
console.log("builder coverage summary:", metrics);
fs.writeFileSync(
  path.join(outDir, "summary.json"),
  JSON.stringify(metrics, null, 2) + "\n",
);

const floor = 100;
const failed = Object.entries(metrics).filter(([, pct]) => pct < floor);
if (failed.length) {
  console.error(
    `builder coverage below ${floor}%:`,
    failed.map(([k, v]) => `${k}=${v}`).join(", "),
  );
  process.exit(1);
}
