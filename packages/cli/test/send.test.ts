import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  ADR008_CHAT_ID,
  configuredMessengers,
  deliver,
  deliverLive,
  deliverMock,
  formatConfigValidationError,
  loadConfigFile,
  resolveConfigPaths,
  runCli,
  send,
} from "../src/index.js";
import { parseConfig } from "@allure-notifications/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Compiled at packages/cli/dist/test → fixtures live at packages/cli/test/fixtures */
const FIXTURE_CONFIG = join(__dirname, "../../test/fixtures/config.dry-run.json");
const DOGFOOD_CONFIG = join(
  __dirname,
  "../../test/fixtures/config.dogfood-cb870.json",
);

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

  it("dry-run with no messengers configured returns skipped telegram", () => {
    const results = deliverMock(
      { base: {} },
      { dryRun: true, mock: false, pngBytes: 0 },
    );
    assert.equal(results.length, 1);
    assert.equal(results[0]!.status, "skipped");
    assert.match(results[0]!.detail, /no messengers configured/);
  });

  it("mock delivery reports mocked status", () => {
    const results = deliverMock(
      { base: {}, telegram: { token: "x", chat: "1" } },
      { dryRun: false, mock: true, pngBytes: 99 },
    );
    assert.equal(results[0]!.status, "mocked");
    assert.match(results[0]!.detail, /mock delivery ok/);
  });
});

describe("@allure-notifications/cli messengers live", () => {
  it("live with no messengers configured returns skipped telegram", async () => {
    const results = await deliverLive(
      { base: {} },
      {
        dryRun: false,
        mock: false,
        live: true,
        png: Buffer.from([1]),
        pngBytes: 1,
      },
    );
    assert.equal(results[0]!.status, "skipped");
    assert.match(results[0]!.detail, /no messengers configured/);
  });

  it("live skips non-telegram messengers", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 1, chat: { id: 1 } },
        }),
        { status: 200 },
      );

    const results = await deliverLive(
      {
        base: {},
        slack: { token: "s" },
        telegram: { token: "t", chat: ADR008_CHAT_ID },
      },
      {
        dryRun: false,
        mock: false,
        live: true,
        png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        pngBytes: 4,
        env: { TELEGRAM_BOT_TOKEN: "1:t", TELEGRAM_CHAT_ID: ADR008_CHAT_ID },
        fetchImpl,
      },
    );

    assert.equal(results.length, 2);
    const slack = results.find((r) => r.messenger === "slack");
    const telegram = results.find((r) => r.messenger === "telegram");
    assert.ok(slack);
    assert.ok(telegram);
    assert.equal(slack!.status, "skipped");
    assert.match(slack!.detail, /not implemented/);
    assert.equal(telegram!.status, "sent");
  });

  it("live topicPart falls back to credentials.topic when API omits thread id", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 7, chat: { id: Number(ADR008_CHAT_ID) } },
        }),
        { status: 200 },
      );

    const results = await deliver(
      { base: {}, telegram: { token: "t", chat: ADR008_CHAT_ID, topic: "34" } },
      {
        dryRun: false,
        mock: false,
        live: true,
        png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        pngBytes: 4,
        env: { TELEGRAM_BOT_TOKEN: "1:t", TELEGRAM_CHAT_ID: ADR008_CHAT_ID },
        fetchImpl,
      },
    );

    assert.equal(results[0]!.status, "sent");
    assert.match(results[0]!.detail, /topic=34/);
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
    assert.equal(result.live, false);
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
      assert.equal(result.live, false);
      assert.equal(result.pngPath, out);
      assert.equal(result.deliveries[0]!.status, "mocked");
      const onDisk = await readFile(out);
      assert.ok(isPng(onDisk));
      assert.equal(onDisk.byteLength, result.png.byteLength);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("live path with mocked fetch sends telegram once", async () => {
    let fetchCalls = 0;
    const fetchImpl: typeof fetch = async () => {
      fetchCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 99,
            message_thread_id: 34,
            chat: { id: Number(ADR008_CHAT_ID) },
          },
        }),
        { status: 200 },
      );
    };

    const result = await send({
      configPath: DOGFOOD_CONFIG,
      live: true,
      env: {
        TELEGRAM_BOT_TOKEN: "1:test-token",
        TELEGRAM_CHAT_ID: ADR008_CHAT_ID,
        TELEGRAM_TOPIC_ID: "34",
      },
      fetchImpl,
    });

    assert.equal(result.live, true);
    assert.equal(result.dryRun, false);
    assert.equal(result.deliveries[0]!.status, "sent");
    assert.equal(result.deliveries[0]!.messageId, 99);
    assert.match(result.deliveries[0]!.detail, /message_id=99/);
    assert.doesNotMatch(result.deliveries[0]!.detail, /test-token/);
    assert.equal(fetchCalls, 1);
  });

  it("default without flags stays dry-run even if env token present", async () => {
    const result = await send({
      configPath: FIXTURE_CONFIG,
      env: { TELEGRAM_BOT_TOKEN: "1:should-not-send" },
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.live, false);
    assert.equal(result.deliveries[0]!.status, "dry-run");
  });
});

describe("@allure-notifications/cli send path resolution", () => {
  it("resolveConfigPaths resolves relative and absolute folders + historyPath", () => {
    const configDir = "/tmp/an-config";
    const resolved = resolveConfigPaths(
      parseConfig({
        base: {
          allureFolder: "report/",
          allureResultsFolder: "/abs/results",
          chart: {
            mode: "collage",
            layout: "free",
            width: 870,
            height: 1080,
            historyPath: "history/trend.json",
            items: [{ type: "pie", x: 0, y: 0, w: 2, h: 2 }],
          },
        },
      }),
      configDir,
    );
    assert.equal(resolved.base.allureFolder, join(configDir, "report"));
    assert.equal(resolved.base.allureResultsFolder, "/abs/results");
    assert.equal(
      resolved.base.chart?.historyPath,
      join(configDir, "history/trend.json"),
    );
  });

  it("resolveConfigPaths preserves empty relative paths unchanged", () => {
    const resolved = resolveConfigPaths(
      parseConfig({
        base: {
          allureFolder: "   ",
          chart: {
            mode: "collage",
            layout: "free",
            width: 870,
            height: 1080,
            items: [{ type: "pie", x: 0, y: 0, w: 2, h: 2 }],
          },
        },
      }),
      "/tmp/base",
    );
    assert.equal(resolved.base.allureFolder, "   ");
  });

  it("loadConfigFile rejects invalid JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-cli-json-"));
    const cfg = join(dir, "bad.json");
    try {
      await writeFile(cfg, "{ not json");
      await assert.rejects(() => loadConfigFile(cfg), /invalid JSON/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("formatConfigValidationError passes through non-Zod Error and stringifies others", () => {
    const plain = new Error("boom");
    assert.equal(
      formatConfigValidationError(plain, "/x.json").message,
      "boom",
    );
    assert.equal(
      formatConfigValidationError("plain string", "/x.json").message,
      "plain string",
    );
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
    assert.match(result.stdout, /mode: dry-run/);
    assert.match(result.stdout, /ok/);
    assert.equal(result.stderr, "");
  });

  it("send --mock reports mock mode label", async () => {
    const result = await runCli([
      "send",
      "--config",
      FIXTURE_CONFIG,
      "--mock",
    ]);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.match(result.stdout, /mode: mock/);
    assert.match(result.stdout, /\[mocked\] telegram/);
  });

  it("send --live with env + mocked fetch reports live mode label", async () => {
    const prevFetch = globalThis.fetch;
    const prevToken = process.env.TELEGRAM_BOT_TOKEN;
    const prevChat = process.env.TELEGRAM_CHAT_ID;
    process.env.TELEGRAM_BOT_TOKEN = "1:test-token";
    process.env.TELEGRAM_CHAT_ID = ADR008_CHAT_ID;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 1,
            message_thread_id: 34,
            chat: { id: Number(ADR008_CHAT_ID) },
          },
        }),
        { status: 200 },
      );
    try {
      const result = await runCli([
        "send",
        "--config",
        DOGFOOD_CONFIG,
        "--live",
      ]);
      assert.equal(result.exitCode, 0, result.stderr);
      assert.match(result.stdout, /mode: live/);
    } finally {
      globalThis.fetch = prevFetch;
      if (prevToken === undefined) {
        delete process.env.TELEGRAM_BOT_TOKEN;
      } else {
        process.env.TELEGRAM_BOT_TOKEN = prevToken;
      }
      if (prevChat === undefined) {
        delete process.env.TELEGRAM_CHAT_ID;
      } else {
        process.env.TELEGRAM_CHAT_ID = prevChat;
      }
    }
  });

  it("send without --config exits 1", async () => {
    const result = await runCli(["send"]);
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /--config/);
  });

  it("invalid chart item sizes get path-scoped error (not Zod JSON dump)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "an-cli-bad-"));
    const cfg = join(dir, "bad.json");
    try {
      await writeFile(
        cfg,
        JSON.stringify({
          base: {
            project: "bad",
            allureFolder: dirname(FIXTURE_CONFIG),
            chart: {
              layout: "free",
              width: 870,
              height: 1080,
              gridCols: 10,
              gridRows: 10,
              items: [{ type: "pie", x: 0, y: 0, w: 0, h: 0 }],
            },
          },
        }),
      );
      const result = await runCli(["send", "--config", cfg, "--dry-run"]);
      assert.equal(result.exitCode, 1);
      assert.match(result.stderr, /invalid config/);
      assert.match(result.stderr, /base\.chart\.items\.0\.w/);
      assert.doesNotMatch(result.stderr, /"code":\s*"too_small"/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("@allure-notifications/cli live gated", () => {
  it("skips real network live test unless ALLURE_NOTIFICATIONS_LIVE_TEST=1", async () => {
    if (process.env.ALLURE_NOTIFICATIONS_LIVE_TEST !== "1") {
      return;
    }
    const token =
      process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
    assert.ok(token, "live test requires TELEGRAM_BOT_TOKEN");

    const result = await send({
      configPath: DOGFOOD_CONFIG,
      live: true,
      env: {
        ...process.env,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || ADR008_CHAT_ID,
        TELEGRAM_TOPIC_ID:
          process.env.TELEGRAM_TOPIC_ID ||
          process.env.TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID ||
          "34",
      },
    });
    assert.equal(result.live, true);
    assert.equal(result.deliveries[0]!.status, "sent");
    assert.ok(result.deliveries[0]!.messageId);
  });
});
