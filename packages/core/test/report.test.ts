import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  adaptSummaryJson,
  buildAnalytics,
  durationMsOf,
  labelOf,
  parseTestResult,
  readAllureResults,
  readSummary,
  resolveResultsFolder,
  suiteNameOf,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

describe("@allure-notifications/core report", () => {
  it("adapts Allure 3 summary.json stats → Statistic", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    assert.equal(summary.statistic.total, 10);
    assert.equal(summary.statistic.passed, 8);
    assert.equal(summary.statistic.failed, 1);
    assert.equal(summary.statistic.skipped, 1);
    assert.equal(summary.durationMs, 24011);
  });

  it("adaptSummaryJson accepts A2 widgets shape", () => {
    const summary = adaptSummaryJson({
      statistic: { total: 3, passed: 2, failed: 1, broken: 0, skipped: 0 },
      time: { duration: 1000 },
    });
    assert.equal(summary.statistic.passed, 2);
    assert.equal(summary.durationMs, 1000);
  });

  it("reads *-result.json and builds layer/duration analytics", async () => {
    const results = await readAllureResults(
      join(fixtures, "allure-results"),
    );
    assert.equal(results.length, 3);

    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const analytics = buildAnalytics(summary, results);

    assert.equal(analytics.layers.unit, 1);
    assert.equal(analytics.layers.integration, 1);
    assert.equal(analytics.layers.e2e, 1);
    assert.equal(analytics.hasKnownLayerLabels, true);
    assert.equal(analytics.durationsMs.length, 3);
    assert.ok(analytics.durationsMsByLayer.unit?.length === 1);
  });

  it("suiteNameOf falls back to fullName then name", () => {
    assert.equal(
      suiteNameOf({ labels: [], fullName: "pkg.Test", name: "Test" }),
      "pkg.Test",
    );
    assert.equal(suiteNameOf({ labels: [], name: "OnlyName" }), "OnlyName");
    assert.equal(suiteNameOf({ labels: [] }), null);
  });

  it("durationMsOf requires start and stop", () => {
    assert.equal(durationMsOf({ labels: [], start: 1, stop: 4 }), 3);
    assert.equal(durationMsOf({ labels: [] }), null);
  });

  it("labelOf returns matching label value", () => {
    const r = {
      labels: [{ name: "feature", value: "Auth" }],
    };
    assert.equal(labelOf(r, "feature"), "Auth");
    assert.equal(labelOf(r, "missing"), null);
  });

  it("resolveResultsFolder prefers explicit trimmed path", async () => {
    assert.equal(
      await resolveResultsFolder("  /tmp/results  ", undefined),
      "/tmp/results",
    );
  });
});
