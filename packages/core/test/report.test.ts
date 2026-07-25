import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  adaptSummaryJson,
  buildAnalytics,
  readAllureResults,
  readSummary,
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
});
