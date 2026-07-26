import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADR008_CHAT_ID,
  buildTelegramCaption,
  resolveTelegramCredentials,
  sendTelegramPhoto,
} from "../src/telegram.js";

describe("@allure-notifications/cli telegram credentials", () => {
  it("prefers env token/topic over config; keeps config chat when set", () => {
    const creds = resolveTelegramCredentials({
      config: {
        base: {},
        telegram: {
          token: "config-token",
          chat: ADR008_CHAT_ID,
          topic: "9",
        },
      },
      env: {
        TELEGRAM_BOT_TOKEN: "env-token",
        TELEGRAM_TOPIC_ID: "34",
      },
    });
    assert.equal(creds.token, "env-token");
    assert.equal(creds.chat, ADR008_CHAT_ID);
    assert.equal(creds.topic, "34");
  });

  it("applies ADR 008 chat when config/env chat empty", () => {
    const creds = resolveTelegramCredentials({
      config: { base: {}, telegram: { token: "t" } },
      env: {},
    });
    assert.equal(creds.chat, ADR008_CHAT_ID);
  });

  it("uses TELEGRAM_CHAT_ID when set", () => {
    const creds = resolveTelegramCredentials({
      config: { base: {}, telegram: { token: "t" } },
      env: {
        TELEGRAM_TOKEN: "legacy-token",
        TELEGRAM_CHAT_ID: "-1004381150566",
        TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID: "34",
      },
    });
    assert.equal(creds.token, "legacy-token");
    assert.equal(creds.chat, "-1004381150566");
    assert.equal(creds.topic, "34");
  });

  it("refuses retired dogfood chat", () => {
    assert.throws(
      () =>
        resolveTelegramCredentials({
          config: {
            base: {},
            telegram: { token: "t", chat: "-1001587609458" },
          },
          env: {},
        }),
      /retired dogfood chat/,
    );
  });

  it("requires token", () => {
    assert.throws(
      () =>
        resolveTelegramCredentials({
          config: { base: {}, telegram: { chat: ADR008_CHAT_ID } },
          env: {},
        }),
      /TELEGRAM_BOT_TOKEN/,
    );
  });
});

describe("@allure-notifications/cli telegram caption + sendPhoto", () => {
  it("builds HTML caption without leaking secrets", () => {
    const caption = buildTelegramCaption(
      {
        base: {
          project: "allure-notifications",
          environment: "6.0-dogfood",
          comment: "CB-870",
        },
        telegram: { token: "SECRET_TOKEN_VALUE" },
      },
      {
        statistic: {
          passed: 2,
          failed: 1,
          broken: 0,
          skipped: 0,
          unknown: 0,
          total: 3,
        },
        layers: {},
        suites: [],
        durationsMs: [],
        durationsMsByLayer: {},
        severities: {},
        hasLayerLabels: false,
        hasKnownLayerLabels: false,
        resultCount: 3,
        history: null,
        stabilityCases: [],
      },
    );
    assert.match(caption, /allure-notifications/);
    assert.match(caption, /CB-870/);
    assert.match(caption, /total:<\/b> 3/);
    assert.doesNotMatch(caption, /SECRET_TOKEN_VALUE/);
  });

  it("sendTelegramPhoto posts multipart and returns message id (mocked fetch)", async () => {
    const calls: { url: string; method?: string }[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push({ url: url.replace(/bot[^/]+/, "bot<redacted>"), method: init?.method });
      assert.ok(url.includes("/sendPhoto"));
      assert.equal(init?.method, "POST");
      assert.ok(init?.body instanceof FormData);
      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 4242,
            message_thread_id: 34,
            chat: { id: -1004381150566 },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    const result = await sendTelegramPhoto({
      credentials: {
        token: "123:SECRET",
        chat: ADR008_CHAT_ID,
        topic: "34",
      },
      png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      caption: "<b>test</b>",
      fetchImpl,
    });

    assert.equal(result.messageId, 4242);
    assert.equal(result.chatId, -1004381150566);
    assert.equal(result.messageThreadId, 34);
    assert.equal(calls.length, 1);
  });

  it("sendTelegramPhoto surfaces Bot API errors", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: false, description: "chat not found" }), {
        status: 400,
      });

    await assert.rejects(
      () =>
        sendTelegramPhoto({
          credentials: { token: "1:t", chat: ADR008_CHAT_ID },
          png: Buffer.from([1, 2, 3]),
          caption: "x",
          fetchImpl,
        }),
      /chat not found/,
    );
  });
});
