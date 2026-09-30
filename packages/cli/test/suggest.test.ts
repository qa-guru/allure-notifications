import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";
import { isKitOnlyChartItem, parseConfig, resolvePanelMeta } from "@qa-guru/allure-notifications-config";

import { parseArgs, runCli, suggest } from "../src/index.js";

declareSuite({
  feature: "cli-suggest",
  story: "Offline suggest CLI",
  layer: "e2e",
  component: "allure-notifications",
  severity: "critical",
});

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const fixtures = join(repoRoot, "packages/core/test/fixtures");
const results = join(fixtures, "dogfood-results");
const bin = join(repoRoot, "packages/cli/dist/src/bin.js");
const offlineGuard = "data:text/javascript," + encodeURIComponent(
  'import { Socket } from "node:net"; Socket.prototype.connect = function () { throw new Error("network forbidden in suggest e2e"); }; globalThis.fetch = async () => { throw new Error("fetch forbidden in suggest e2e"); };',
);

function runBin(argv: string[], cwd = repoRoot) {
  return spawnSync(process.execPath, ["--import", offlineGuard, bin, ...argv], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, TELEGRAM_BOT_TOKEN: "1:offline-test-token", TELEGRAM_CHAT_ID: "0" },
  });
}

describe("suggest CLI", () => {
  it("prints only send-valid config JSON on stdout with all networking blocked", () => {
    const child = runBin(["suggest", "--results", results]);
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stderr, "");
    const config = parseConfig(JSON.parse(child.stdout));
    assert.equal(config.base.allureResultsFolder, results);
    assert.equal(config.base.darkMode, true);
    assert.equal(config.base.chart?.items?.[0]?.type, "currentStatus");
    assert.equal(config.base.chart?.headerHeight, 31);
    assert.equal(config.base.chart?.cardGap, 14);
    assert.equal(config.base.chart?.tilePad, 6);
    assert.equal(config.base.chart?.pyramidFallback, "suites");
    assert.ok(config.base.chart?.items?.some((item) => item.type === "problemsDistribution"));
    assert.equal(config.telegram, undefined);
    assert.equal(config.proxy, undefined);
    assert.equal(config.ai, undefined);
    assert.doesNotMatch(child.stdout, /offline-test-token|collage:|mode:|deliveries/);
  });

  it("supports explicit kit profile and equals-form flags without send modes", async () => {
    const result = await runCli(["suggest", `--results=${results}`, "--profile=kit"]);
    assert.equal(result.exitCode, 0, result.stderr);
    const config = parseConfig(JSON.parse(result.stdout));
    assert.equal(config.base.chart?.profile, "kit");
    const args = parseArgs(["suggest", "--results", results, "--profile", "default"]);
    assert.equal(args.command, "suggest");
    assert.equal(args.dryRun, false);
    assert.equal(args.live, false);
    assert.deepEqual(args.errors, []);
  });

  it("writes JSON, not PNG, to --out without changing the source config", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-out-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const source = join(repoRoot, "config/config.dogfood-telegram-full.json");
    const original = await readFile(source, "utf8");
    const out = join(dir, "suggested.json");
    const child = runBin(["suggest", "--results", results, "--config", source, "--out", out]);
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stdout, "");
    const config = parseConfig(JSON.parse(await readFile(out, "utf8")));
    assert.equal(config.base.chart?.historyPath, join(fixtures, "history-dogfood-full.jsonl"));
    assert.equal(config.base.allureFolder, join(fixtures, "dogfood-report"));
    assert.equal(config.telegram, undefined);
    assert.equal(await readFile(source, "utf8"), original);
    assert.deepEqual(await readdir(dir), ["suggested.json"]);
  });

  it("supports ADR --write as a cwd-relative alias of --out", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-write-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const child = runBin(["suggest", "--results", results, "--write=layout.json"], dir);
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stdout, "");
    assert.ok(parseConfig(JSON.parse(await readFile(join(dir, "layout.json"), "utf8"))).base.chart);
  });

  it("discovers kit files beside results without inventing or fetching payloads", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-kit-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const input = join(dir, "allure-results");
    await cp(results, input, { recursive: true });
    await cp(join(fixtures, "history-dogfood-full.jsonl"), join(input, "history.jsonl"));
    await cp(join(fixtures, "quality-gate/aqg-passed.json"), join(input, "allureQualityGate.json"));
    await cp(join(fixtures, "sonar/project-status-passed.json"), join(input, "sonarQualityGate.json"));
    await cp(join(fixtures, "tests-table/tests-table-panel.json"), join(input, "testsTable.json"));
    const child = runBin(["suggest", "--results", input]);
    assert.equal(child.status, 0, child.stderr);
    const config = parseConfig(JSON.parse(child.stdout));
    const chart = config.base.chart!;
    assert.equal(chart.profile, "kit");
    assert.equal(chart.width, 1410);
    assert.equal(chart.height, 1080);
    const ids = chart.items!.map((item) => resolvePanelMeta(item)?.id);
    for (const id of ["allureQualityGate", "testsTable", "durationDynamics", "statusDynamics", "testingPyramid", "durationsByLayer"]) {
      assert.ok(ids.includes(id), id);
    }
    assert.equal(chart.sonarQualityGatePath, undefined);
    assert.equal(chart.testsTablePath, join(input, "testsTable.json"));
    assert.equal(chart.allureQualityGatePath, join(input, "allureQualityGate.json"));
  });

  it("uses configured rules and paths as facts, honours --profile and omits messenger secrets", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-config-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const source = join(dir, "existing.json");
    await writeFile(source, JSON.stringify({
      base: { chart: { sonarQualityGatePath: join(fixtures, "sonar/project-status-passed.json") } },
      qualityGate: { rules: [{ maxFailures: 0 }] },
      telegram: { token: "not-for-suggest-output", chat: "0" },
      ai: { apiKey: "not-for-suggest-output" },
    }));
    const auto = runBin(["suggest", "--results", results, "--config", source]);
    assert.equal(auto.status, 0, auto.stderr);
    const kit = parseConfig(JSON.parse(auto.stdout));
    assert.equal(kit.base.chart?.profile, "kit");
    assert.ok(kit.base.chart?.items?.some((item) => item.id === "allureQualityGate"));
    assert.match(auto.stderr, /warning: allureQualityGate selected from qualityGate.rules/);
    assert.doesNotMatch(auto.stdout, /not-for-suggest-output|apiKey|telegram/);
    const stock = runBin(["suggest", "--results", results, "--config", source, "--profile", "default"]);
    assert.equal(stock.status, 0, stock.stderr);
    assert.equal(parseConfig(JSON.parse(stock.stdout)).base.chart?.items?.some(isKitOnlyChartItem), false);
  });

  it("emits the selected raw Sonar payload path without an Allure gate", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-sonar-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const source = join(dir, "sonar.json");
    const sonarPath = join(fixtures, "sonar/project-status-passed.json");
    await writeFile(source, JSON.stringify({ base: { chart: { sonarQualityGatePath: sonarPath } } }));
    const child = runBin(["suggest", "--results", results, "--config", source]);
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stderr, "");
    const chart = parseConfig(JSON.parse(child.stdout)).base.chart!;
    assert.equal(chart.profile, "kit");
    assert.ok(chart.items?.some((item) => item.id === "sonarQualityGate"));
    assert.equal(chart.sonarQualityGatePath, sonarPath);
    assert.equal(chart.allureQualityGatePath, undefined);
  });

  it("supports programmatic cwd and preserves an existing explicit kit profile without networking", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-api-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await cp(results, join(dir, "results"), { recursive: true });
    await writeFile(join(dir, "input.json"), JSON.stringify({ base: { chart: { profile: "kit" } } }));
    const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("network forbidden in suggest"); });
    const result = await suggest({ cwd: dir, resultsFolder: "results", configPath: "input.json", out: "layout.json" });
    assert.equal(result.outPath, join(dir, "layout.json"));
    assert.equal(result.config.base.chart?.profile, "kit");
    assert.equal(result.config.base.allureResultsFolder, join(dir, "results"));
    assert.equal(await readFile(result.outPath!, "utf8"), result.json);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("never overwrites an existing --out file", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-existing-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const out = join(dir, "existing.json");
    await writeFile(out, "keep me");
    const result = await runCli(["suggest", "--results", results, "--out", out]);
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /EEXIST|already exists/);
    assert.equal(await readFile(out, "utf8"), "keep me");
  });

  it("validates results, profile, flags and the existing config before producing output", async (t) => {
    for (const argv of [
      ["suggest"],
      ["suggest", "--results"],
      ["suggest", "--results="],
      ["suggest", "--results", results, "--profile", "unknown"],
      ["suggest", "--results", results, "--profile"],
      ["suggest", "--results", results, "--write"],
      ["suggest", "--results", results, "--live"],
      ["suggest", "--results", results, "--mock"],
      ["suggest", "--results", results, "--dry-run"],
      ["suggest", "--results", results, "--project", "unsupported"],
      ["send", "--config", "x.json", "--results", results],
    ]) {
      const result = await runCli(argv);
      assert.equal(result.exitCode, 1, argv.join(" "));
      assert.equal(result.stdout, "");
      assert.ok(result.stderr.length > 0);
    }
    const missing = await runCli(["suggest", "--results", join(fixtures, "missing-results")]);
    assert.equal(missing.exitCode, 1);
    assert.match(missing.stderr, /ENOENT|results directory/);
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-invalid-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const input = join(dir, "invalid.json");
    await writeFile(input, JSON.stringify({ base: { chart: { profile: "wrong" } } }));
    const invalid = await runCli(["suggest", "--results", results, "--config", input]);
    assert.equal(invalid.exitCode, 1);
    assert.match(invalid.stderr, /base.chart.profile/);
  });

  it("documents both entry points in --help", async () => {
    const result = await runCli(["--help"]);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /suggest --results/);
    assert.match(result.stdout, /--profile/);
    assert.match(result.stdout, /--write/);
  });
});
