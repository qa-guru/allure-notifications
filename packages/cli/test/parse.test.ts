import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { helpText, parseArgs } from "../src/parse.js";

describe("@allure-notifications/cli parseArgs", () => {
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
  });

  it("help and version commands", () => {
    assert.equal(parseArgs(["--help"]).command, "help");
    assert.equal(parseArgs(["-V"]).command, "version");
    assert.ok(helpText().includes("send --config"));
  });
});
