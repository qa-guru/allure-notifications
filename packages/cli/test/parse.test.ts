import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "cli-send",
  story: "CLI parseArgs",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

import { VERSION, runCli } from "../src/cli.js";
import { helpText, parseArgs } from "../src/parse.js";

const require = createRequire(import.meta.url);
const pkgVersion = (
  require("../../package.json") as { version: string }
).version;

describe("@qa-guru/allure-notifications parseArgs", () => {
  it("parses send --config path", () => {
    const args = parseArgs(["send", "--config", "config.json"]);
    assert.equal(args.command, "send");
    assert.equal(args.configPath, "config.json");
    assert.equal(args.errors.length, 0);
    // Safe default when neither flag is set
    assert.equal(args.dryRun, true);
    assert.equal(args.mock, false);
    assert.equal(args.live, false);
  });

  it("parses --live and keeps dry-run/mock winning over live", () => {
    const live = parseArgs(["send", "--config", "a.json", "--live"]);
    assert.equal(live.live, true);
    assert.equal(live.dryRun, false);
    assert.equal(live.mock, false);

    const dryWins = parseArgs([
      "send",
      "--config",
      "a.json",
      "--live",
      "--dry-run",
    ]);
    assert.equal(dryWins.dryRun, true);
    assert.equal(dryWins.live, false);
  });

  it("parses --config= and --out=", () => {
    const args = parseArgs([
      "send",
      "--config=./cfg.json",
      "--mock",
      "--out=out.png",
    ]);
    assert.equal(args.configPath, "./cfg.json");
    assert.equal(args.out, "out.png");
    assert.equal(args.mock, true);
    assert.equal(args.dryRun, false);
    assert.equal(args.errors.length, 0);
  });

  it("parses --out <path> as separate argv token", () => {
    const args = parseArgs([
      "send",
      "--config",
      "cfg.json",
      "--out",
      "collage.png",
    ]);
    assert.equal(args.out, "collage.png");
    assert.equal(args.errors.length, 0);
  });

  it("parses config and link overrides in separate and equals forms", () => {
    const args = parseArgs([
      "send",
      "--config",
      "notifications/config.json",
      "--allure-folder",
      "build/report/awesome",
      "--allure-results-folder=build/allure-results",
      "--project",
      "Multistack",
      "--report-url=https://example.test/report",
      "--dashboard-url",
      "https://example.test/dashboard",
      "--testops-url=https://example.test/launch/1",
      "--build-url",
      "https://github.test/actions/runs/1",
    ]);
    assert.equal(args.allureFolder, "build/report/awesome");
    assert.equal(args.allureResultsFolder, "build/allure-results");
    assert.equal(args.project, "Multistack");
    assert.equal(args.reportUrl, "https://example.test/report");
    assert.equal(args.dashboardUrl, "https://example.test/dashboard");
    assert.equal(args.testopsUrl, "https://example.test/launch/1");
    assert.equal(args.buildUrl, "https://github.test/actions/runs/1");
    assert.equal(args.errors.length, 0);
  });

  it("parses -c / --dry-run", () => {
    const args = parseArgs(["send", "-c", "a.json", "--dry-run"]);
    assert.equal(args.configPath, "a.json");
    assert.equal(args.dryRun, true);
    assert.equal(args.mock, false);
  });

  it("errors when send lacks --config", () => {
    const args = parseArgs(["send", "--dry-run"]);
    assert.ok(args.errors.some((e) => e.includes("--config")));
  });

  it("errors on unknown flags", () => {
    const args = parseArgs(["send", "--config", "x.json", "--teleport"]);
    assert.ok(args.errors.some((e) => e.includes("unknown")));

    const unknownEquals = parseArgs([
      "send",
      "--config",
      "x.json",
      "--teleport=yes",
    ]);
    assert.ok(unknownEquals.errors.some((e) => e.includes("unknown")));

    const shortEquals = parseArgs(["send", "-c=x.json"]);
    assert.ok(shortEquals.errors.some((e) => e.includes("unknown")));
  });

  it("help and version commands", () => {
    assert.equal(parseArgs(["--help"]).command, "help");
    assert.equal(parseArgs(["-V"]).command, "version");
    assert.ok(helpText().includes("send --config"));
  });

  it("empty argv defaults to help without errors", () => {
    const args = parseArgs([]);
    assert.equal(args.command, "help");
    assert.equal(args.errors.length, 0);
  });

  it("junk argv without command yields help and missing-command error", () => {
    const args = parseArgs(["--foo", "bar"]);
    assert.equal(args.command, "help");
    assert.ok(args.errors.some((e) => e.includes('missing command')));
    assert.ok(args.errors.some((e) => e.includes("unknown argument")));
  });

  it("errors on duplicate commands", () => {
    const args = parseArgs(["send", "help", "--config", "x.json"]);
    assert.ok(args.errors.some((e) => e.includes('unexpected command "help"')));
  });

  it("errors when --config / --config= lack a path", () => {
    const missingNext = parseArgs(["send", "--config"]);
    assert.ok(missingNext.errors.some((e) => e.includes("--config requires")));

    const flagValue = parseArgs(["send", "--config", "--dry-run"]);
    assert.ok(flagValue.errors.some((e) => e.includes("--config requires")));

    const emptyEq = parseArgs(["send", "--config="]);
    assert.ok(emptyEq.errors.some((e) => e.includes("--config requires")));
  });

  it("errors when --out / --out= lack a path", () => {
    const missingNext = parseArgs([
      "send",
      "--config",
      "x.json",
      "--out",
    ]);
    assert.ok(missingNext.errors.some((e) => e.includes("--out requires")));

    const flagValue = parseArgs([
      "send",
      "--config",
      "x.json",
      "--out",
      "--mock",
    ]);
    assert.ok(flagValue.errors.some((e) => e.includes("--out requires")));

    const emptyEq = parseArgs(["send", "--config", "x.json", "--out="]);
    assert.ok(emptyEq.errors.some((e) => e.includes("--out requires")));

    const emptyOverride = parseArgs([
      "send",
      "--config",
      "x.json",
      "--project=",
    ]);
    assert.ok(emptyOverride.errors.some((e) => e.includes("--project requires")));

    const missingOverride = parseArgs([
      "send",
      "--config",
      "x.json",
      "--project",
      "--dry-run",
    ]);
    assert.ok(missingOverride.errors.some((e) => e.includes("--project requires")));
  });
});

describe("@qa-guru/allure-notifications runCli help", () => {
  it("help with parse errors exits 1 and prints errors to stderr", async () => {
    const result = await runCli(["--foo"]);
    assert.equal(result.exitCode, 1);
    assert.match(result.stdout, /Usage:/);
    assert.match(result.stderr, /missing command/);
  });

  it("bare help exits 0", async () => {
    const result = await runCli([]);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /Usage:/);
    assert.equal(result.stderr, "");
  });
});

describe("@qa-guru/allure-notifications VERSION", () => {
  it("matches packages/cli/package.json (no stale 6.0.0 pin)", async () => {
    assert.equal(VERSION, pkgVersion);
    assert.match(VERSION, /^6\.\d+\.\d+$/);
    assert.notEqual(VERSION, "6.0.0", "6.0.1+ must not report 6.0.0");

    const result = await runCli(["-V"]);
    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout.trim(), pkgVersion);
  });
});
