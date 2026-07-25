import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  configuredMessengers,
  deliverMock,
  runCli,
  send,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Compiled at packages/cli/dist/test → fixtures live at packages/cli/test/fixtures */
const FIXTURE_CONFIG = join(__dirname, "../../test/fixtures/config.dry-run.json");

function isPng(buf: Buffer): boolean {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

describe("@allure-notifications/cli messengers mock", () => {
  it("lists configured messengers without network", () => {
    const ids = configuredMessengers({
      base: {},
      telegram: { token: "x", chat: "1" },
      slack: { token: "y" },
    });
    assert.deepEqual(ids, ["telegram", "slack"]);
  });

  it("dry-run delivery never claims mocked live send", () => {
    const results = deliverMock(
      { base: {}, telegram: { token: "x", chat: "1" } },
      { dryRun: true, mock: false, pngBytes: 42 },
    );
    assert.equal(results.length, 1);
    assert.equal(results[0]!.status, "dry-run");
    assert.match(results[0]!.detail, /no network/);
  });
});

describe("@allure-notifications/cli send dry-run", () => {
  it("renders PNG buffer from fixture config (no network)", async () => {
    const result = await send({
      configPath: FIXTURE_CONFIG,
      dryRun: true,
    });
    assert.ok(isPng(result.png), "expected PNG magic bytes");
    assert.ok(result.png.byteLength > 1000);
    assert.equal(result.dryRun, true);
    assert.equal(result.deliveries[0]!.messenger, "telegram");
    assert.equal(result.deliveries[0]!.status, "dry-run");
    assert.equal(result.pngPath, undefined);
  });

  it("writes PNG to --out path in mock mode", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-cli-"));
    const out = join(dir, "collage.png");
    try {
      const result = await send({
        configPath: FIXTURE_CONFIG,
        mock: true,
        out,
      });
      assert.equal(result.mock, true);
      assert.equal(result.dryRun, false);
      assert.equal(result.pngPath, out);
      assert.equal(result.deliveries[0]!.status, "mocked");
      const onDisk = await readFile(out);
      assert.ok(isPng(onDisk));
      assert.equal(onDisk.byteLength, result.png.byteLength);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("@allure-notifications/cli runCli integration", () => {
  it("send --config --dry-run exits 0 and reports collage size", async () => {
    const result = await runCli([
      "send",
      "--config",
      FIXTURE_CONFIG,
      "--dry-run",
    ]);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.match(result.stdout, /collage: \d+ bytes/);
    assert.match(result.stdout, /\[dry-run\] telegram/);
    assert.match(result.stdout, /ok/);
    assert.equal(result.stderr, "");
  });

  it("send without --config exits 1", async () => {
    const result = await runCli(["send"]);
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /--config/);
  });
});
