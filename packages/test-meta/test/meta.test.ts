import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { declareSuite } from "../src/node-test.js";
import { DEFAULT_EPIC } from "../src/defaults.js";
import type { SuiteMeta } from "../src/types.js";

declareSuite({
  feature: "test-meta",
  story: "Suite metadata helpers",
  layer: "unit",
  component: "@allure-notifications/test-meta",
  severity: "normal",
});

describe("@allure-notifications/test-meta", () => {
  it("DEFAULT_EPIC is allure-notifications", () => {
    assert.equal(DEFAULT_EPIC, "allure-notifications");
  });

  it("SuiteMeta shape accepts required fields", () => {
    const meta: SuiteMeta = {
      feature: "test-meta",
      story: "types",
      layer: "unit",
      severity: "normal",
    };
    assert.equal(meta.feature, "test-meta");
  });
});
