import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { declareSuite } from "@allure-notifications/test-meta";

declareSuite({
  feature: "cli-send",
  story: "Telegram credentials",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

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

  it("requires chat when ADR defaults disabled", () => {
    assert.throws(
      () =>
        resolveTelegramCredentials({
          config: { base: {}, telegram: { token: "t" } },
          env: {},
          applyAdrDefaults: false,
        }),
      /TELEGRAM_CHAT_ID/,
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
        durationMs: 1234,
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
    assert.match(caption, /Results:/);
    assert.match(caption, /CB-870/);
    assert.match(caption, /Total scenarios: <\/b>3/);
    assert.match(caption, /Total passed: <\/b>2 \(66\.7 %\)/);
    assert.match(caption, /Total failed: <\/b>1 \(33\.3 %\)/);
    assert.match(caption, /Duration: <\/b>00:00:01\.234/);
    assert.doesNotMatch(caption, /SECRET_TOKEN_VALUE/);
  });

  it("caption includes RU phrases and HTML links", () => {
    const caption = buildTelegramCaption(
      {
        base: {
          project: "allure-notifications",
          language: "ru",
          environment: "dogfood",
          comment: "full collage",
          links: {
            report: "https://allure.qa.guru/project/5297",
            dashboard:
              "https://sonar.qa.guru/dashboard?id=allure-notifications",
            testops: "https://allure.qa.guru/project/5297",
            build:
              "https://github.com/qa-guru/allure-notifications/actions/runs/30258259618",
          },
        },
        telegram: { token: "SECRET" },
      },
      {
        statistic: {
          passed: 30,
          failed: 2,
          broken: 1,
          skipped: 1,
          unknown: 0,
          total: 34,
        },
        durationMs: 59840,
        layers: {},
        suites: [],
        durationsMs: [],
        durationsMsByLayer: {},
        severities: {},
        hasLayerLabels: false,
        hasKnownLayerLabels: false,
        resultCount: 34,
        history: null,
        stabilityCases: [],
      },
    );
    assert.match(caption, /Результаты:/);
    assert.match(caption, /Рабочее окружение:/);
    assert.match(caption, /Дашборд:/);
    assert.match(caption, /TestOps:/);
    assert.match(caption, /Сборка:/);
    assert.match(
      caption,
      /href="https:\/\/sonar\.qa\.guru\/dashboard\?id=allure-notifications"/,
    );
    assert.doesNotMatch(caption, /SECRET/);
  });

  it("caption includes DE phrases and HTML links", () => {
    const caption = buildTelegramCaption(
      {
        base: {
          project: "allure-notifications",
          language: "de",
          environment: "staging",
          comment: "Nightly run",
          links: {
            report: "https://allure.qa.guru/project/5297",
            dashboard: "https://sonar.qa.guru/dashboard?id=allure-notifications",
            testops: "https://allure.qa.guru/project/5297",
            build: "https://github.com/qa-guru/allure-notifications/actions/runs/1",
          },
        },
        telegram: { token: "SECRET" },
      },
      {
        statistic: {
          passed: 10,
          failed: 1,
          broken: 0,
          skipped: 0,
          unknown: 0,
          total: 11,
        },
        durationMs: 12000,
        layers: {},
        suites: [],
        durationsMs: [],
        durationsMsByLayer: {},
        severities: {},
        hasLayerLabels: false,
        hasKnownLayerLabels: false,
        resultCount: 11,
        history: null,
        stabilityCases: [],
      },
    );
    assert.match(caption, /Ergebnisse:/);
    assert.match(caption, /Umgebung:/);
    assert.match(caption, /Kommentar:/);
    assert.match(caption, /Szenarien gesamt:/);
    assert.match(caption, /Gesamt bestanden:/);
    assert.match(caption, /Bericht:/);
    assert.match(caption, /Dashboard:/);
    assert.doesNotMatch(caption, /Results:/);
    assert.doesNotMatch(caption, /SECRET/);
  });

  it("caption includes morse phrases", () => {
    const caption = buildTelegramCaption(
      {
        base: {
          project: "allure-notifications",
          language: "morse",
          environment: "ci",
          comment: "SOS",
        },
        telegram: { token: "SECRET" },
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
        durationMs: 5000,
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
    assert.ok(caption.includes(".-. . ... ..- .-.. - ...:"));
    assert.ok(caption.includes("- --- - .- .-.. / .--. .- ... ... . -..:"));
    assert.doesNotMatch(caption, /Results:/);
    assert.doesNotMatch(caption, /SECRET/);
  });

  it("sendTelegramPhoto posts multipart and returns message id (mocked fetch)", async () => {
    const calls: { url: string; method?: string; form?: FormData }[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push({
        url: url.replace(/bot[^/]+/, "bot<redacted>"),
        method: init?.method,
        form: init?.body instanceof FormData ? init.body : undefined,
      });
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

  it("sendTelegramPhoto includes reply_to_message_id when replyTo set", async () => {
    let capturedForm: FormData | undefined;
    const fetchImpl: typeof fetch = async (_input, init) => {
      capturedForm = init?.body as FormData;
      return new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 1, chat: { id: Number(ADR008_CHAT_ID) } },
        }),
        { status: 200 },
      );
    };

    await sendTelegramPhoto({
      credentials: {
        token: "1:t",
        chat: ADR008_CHAT_ID,
        replyTo: "555",
      },
      png: Buffer.from([1, 2, 3]),
      caption: "x",
      fetchImpl,
    });

    assert.ok(capturedForm);
    assert.equal(capturedForm!.get("reply_to_message_id"), "555");
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

  it("credentials use empty telegram object; caption edges + HTTP fallback", async () => {
    const creds = resolveTelegramCredentials({
      config: { base: {} },
      env: {
        TELEGRAM_BOT_TOKEN: "env-only",
        TELEGRAM_CHAT_ID: ADR008_CHAT_ID,
      },
    });
    assert.equal(creds.token, "env-only");

    // Inconsistent totals: count > 0 with total <= 0 → printPercentage "(0 %)".
    const zeroTotal = buildTelegramCaption(
      {
        base: {
          language: "en",
          durationFormat: "   ",
        },
      },
      {
        statistic: {
          passed: 2,
          failed: 0,
          broken: 0,
          skipped: 0,
          unknown: 0,
          total: 0,
        },
        durationMs: 0,
        layers: {},
        suites: [],
        durationsMs: [1000, 2000],
        durationsMsByLayer: {},
        severities: {},
        hasLayerLabels: false,
        hasKnownLayerLabels: false,
        resultCount: 0,
        history: null,
        stabilityCases: [],
      },
    );
    assert.match(zeroTotal, /\(0 %\)/);
    assert.match(zeroTotal, /00:00:03/);

    // Hit `config.base ?? {}` when base is missing (cast past Config).
    const noBase = buildTelegramCaption({} as never, undefined);
    assert.match(noBase, /Results:/);

    const integerPct = buildTelegramCaption(
      { base: { project: "p" } },
      {
        statistic: {
          passed: 1,
          failed: 0,
          broken: 0,
          skipped: 0,
          unknown: 0,
          total: 2,
        },
        durationMs: 500,
        layers: {},
        suites: [],
        durationsMs: [],
        durationsMsByLayer: {},
        severities: {},
        hasLayerLabels: false,
        hasKnownLayerLabels: false,
        resultCount: 2,
        history: null,
        stabilityCases: [],
      },
    );
    assert.match(integerPct, /1 \(50 %\)/);

    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: false }), { status: 502 });
    await assert.rejects(
      () =>
        sendTelegramPhoto({
          credentials: { token: "1:t", chat: ADR008_CHAT_ID },
          png: Buffer.from([1]),
          caption: "x",
          fetchImpl,
        }),
      /HTTP 502/,
    );

    const noChatFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 7 },
        }),
        { status: 200 },
      );
    const sent = await sendTelegramPhoto({
      credentials: { token: "1:t", chat: ADR008_CHAT_ID },
      png: Buffer.from([1]),
      caption: "x",
      fetchImpl: noChatFetch,
    });
    assert.equal(sent.chatId, ADR008_CHAT_ID);
    assert.equal(sent.messageId, 7);
  });
});
