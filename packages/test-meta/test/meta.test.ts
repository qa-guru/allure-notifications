import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { declareSuite } from "../src/node-test.js";
import { applySuiteMeta } from "../src/declare-suite.js";
import { DEFAULT_EPIC } from "../src/defaults.js";
import {
  normalizeTestFileKeys,
  parseCallerFromStack,
  registerSuiteMeta,
  resolveDeclareSuiteCaller,
} from "../src/register-suite.js";
import type { SuiteMeta } from "../src/types.js";

if (!process.env.ALLURE_RESULTS_DIR) {
  process.env.ALLURE_RESULTS_DIR = fs.mkdtempSync(
    path.join(os.tmpdir(), "test-meta-suite-"),
  );
}

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

  it("registerSuiteMeta writes registry with source and dist aliases", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-meta-registry-"));
    const prev = process.env.ALLURE_RESULTS_DIR;
    process.env.ALLURE_RESULTS_DIR = tmpDir;
    try {
      const sourceFile = fileURLToPath(import.meta.url);
      registerSuiteMeta(sourceFile, {
        feature: "registry",
        story: "aliases",
        layer: "unit",
        severity: "minor",
        epic: "custom-epic",
      });

      const shardDir = path.join(tmpDir, ".suite-meta-registry.d");
      const shards = fs.readdirSync(shardDir).filter((name) => name.endsWith(".json"));
      assert.ok(shards.length >= 1);
      const shard = JSON.parse(
        fs.readFileSync(path.join(shardDir, shards[0]!), "utf8"),
      ) as {
        keys: string[];
        entry: { feature: string; epic: string; component?: string };
      };
      assert.ok(shard.keys.includes("packages/test-meta/test/meta.test.ts"));
      assert.ok(shard.keys.includes("packages/test-meta/dist/test/meta.test.js"));
      assert.equal(shard.entry.feature, "registry");
      assert.equal(shard.entry.epic, "custom-epic");
      assert.equal(shard.entry.component, undefined);
    } finally {
      if (prev === undefined) delete process.env.ALLURE_RESULTS_DIR;
      else process.env.ALLURE_RESULTS_DIR = prev;
    }
  });

  it("normalizeTestFileKeys maps dist emit to source test path", () => {
    const keys = normalizeTestFileKeys(
      "/repo/packages/core/dist/test/report.test.js",
    );
    assert.ok(keys.includes("packages/core/dist/test/report.test.js"));
    assert.ok(keys.includes("packages/core/test/report.test.ts"));
  });

  it("normalizeTestFileKeys maps source test path to dist emit", () => {
    const keys = normalizeTestFileKeys("/repo/packages/core/test/report.test.ts");
    assert.ok(keys.includes("packages/core/test/report.test.ts"));
    assert.ok(keys.includes("packages/core/dist/test/report.test.js"));
  });

  it("normalizeTestFileKeys maps apps builder tests", () => {
    const keys = normalizeTestFileKeys("/repo/apps/builder/tests/smoke.spec.ts");
    assert.ok(keys.includes("apps/builder/tests/smoke.spec.ts"));
  });

  it("normalizeTestFileKeys maps builder dist/test to tests source", () => {
    const keys = normalizeTestFileKeys(
      "/repo/apps/builder/dist/test/config-parity.test.js",
    );
    assert.ok(keys.includes("apps/builder/tests/config-parity.test.ts"));
  });

  it("parseCallerFromStack parses paren and file URI stack frames", () => {
    assert.match(
      parseCallerFromStack("Error\n    at (/tmp/foo.test.js:1:1)"),
      /foo\.test\.js$/,
    );
    assert.match(
      parseCallerFromStack("Error\n    at file:///tmp/bar.test.js:1:1"),
      /bar\.test\.js$/,
    );
    assert.match(
      parseCallerFromStack("Error\n    at /tmp/baz.spec.js:2:3"),
      /baz\.spec\.js$/,
    );
  });

  it("parseCallerFromStack throws when stack has no test file", () => {
    assert.throws(
      () => parseCallerFromStack("Error\n    at foo.js:1:1"),
      /unable to resolve caller/,
    );
  });

  it("resolveDeclareSuiteCaller handles undefined stack", () => {
    assert.throws(() => resolveDeclareSuiteCaller(undefined), /unable to resolve/);
  });

  it("resolveDeclareSuiteCaller returns this test file", () => {
    const caller = resolveDeclareSuiteCaller(new Error().stack);
    assert.match(caller, /meta\.test\.(ts|js)$/);
  });

  it("registerSuiteMeta requires ALLURE_RESULTS_DIR", () => {
    const prev = process.env.ALLURE_RESULTS_DIR;
    delete process.env.ALLURE_RESULTS_DIR;
    try {
      assert.throws(
        () =>
          registerSuiteMeta("/tmp/sample.test.ts", {
            feature: "x",
            story: "y",
            layer: "unit",
            severity: "normal",
          }),
        /ALLURE_RESULTS_DIR/,
      );
    } finally {
      if (prev === undefined) delete process.env.ALLURE_RESULTS_DIR;
      else process.env.ALLURE_RESULTS_DIR = prev;
    }
  });

  it("applySuiteMeta applies labels via allure-js-commons", async () => {
    await applySuiteMeta({
      feature: "test-meta",
      story: "applySuiteMeta",
      layer: "unit",
      component: "@allure-notifications/test-meta",
      severity: "normal",
    });
  });
});
