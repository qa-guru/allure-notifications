import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

import {
  resolvePanelMeta,
  suggestLayoutViaLlm,
  type SuggestSignals,
} from "../src/index.js";

declareSuite({
  feature: "config",
  story: "Shared LLM advisor (tier 1)",
  layer: "unit",
  component: "@qa-guru/allure-notifications-config",
  severity: "critical",
});

function signals(overrides: Partial<SuggestSignals> = {}): SuggestSignals {
  return {
    statistic: { passed: 10, failed: 0, broken: 0, skipped: 0, unknown: 0, total: 10 },
    durationMs: 1000,
    layers: {},
    hasLayerLabels: false,
    hasKnownLayerLabels: false,
    knownLayerCount: 0,
    severities: {},
    suites: [],
    durationsMsByLayer: {},
    historyRunCount: 0,
    qualityGateRuleCount: 0,
    ...overrides,
  };
}

function ids(layout: { items: Array<{ id?: string; type: string }> }) {
  return layout.items.map((item) => resolvePanelMeta(item)!.id);
}

function fetchReply(body: unknown, init?: { status?: number }) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const impl = async (url: string | URL | Request, request?: RequestInit) => {
    calls.push({ url: String(url), init: request });
    if (init?.status && init.status !== 200) {
      return { ok: false, status: init.status, json: async () => ({}) } as Response;
    }
    return { ok: true, status: 200, json: async () => body } as Response;
  };
  return { impl: impl as typeof fetch, calls };
}

describe("suggestLayoutViaLlm", () => {
  const options = { baseUrl: "https://llm.local/v1", model: "test-model" };

  it("posts compact signals to an OpenAI-compatible endpoint and materializes ids", async () => {
    const reply = fetchReply({
      choices: [{ message: { content: '{"items":["currentStatus","durationDynamics"],"profile":"default"}' } }],
    });
    const layout = await suggestLayoutViaLlm(signals(), { ...options, fetchImpl: reply.impl });
    assert.deepEqual(ids(layout), ["currentStatus", "durationDynamics"]);
    assert.equal(layout.profile, "default");
    assert.equal(reply.calls.length, 1);
    const call = reply.calls[0]!;
    assert.equal(call.url, "https://llm.local/v1/chat/completions");
    assert.equal(call.init?.method, "POST");
    const headers = call.init?.headers as Record<string, string>;
    assert.equal(headers["content-type"], "application/json");
    assert.equal(headers.authorization, undefined);
    const body = JSON.parse(String(call.init?.body));
    assert.equal(body.model, "test-model");
    assert.equal(body.temperature, 0);
    assert.match(body.messages[0].content, /currentStatus/);
    assert.match(body.messages[0].content, /1-7 items/);
    assert.deepEqual(JSON.parse(body.messages[1].content), signals());
  });

  it("sends the API key when configured and accepts fenced JSON", async () => {
    const reply = fetchReply({
      choices: [{ message: { content: '```json\n{"items":["testingPyramid"]}\n```' } }],
    });
    const layout = await suggestLayoutViaLlm(signals(), {
      ...options,
      apiKey: "key-1",
      fetchImpl: reply.impl,
    });
    assert.deepEqual(ids(layout), ["testingPyramid"]);
    assert.equal((reply.calls[0]!.init?.headers as Record<string, string>).authorization, "Bearer key-1");
  });

  it("sends HTTP Basic when the api key carries user:pass (ollama-box2)", async () => {
    const reply = fetchReply({ choices: [{ message: { content: '{"items":["currentStatus"]}' } }] });
    await suggestLayoutViaLlm(signals(), {
      ...options,
      apiKey: "alice:s3cret",
      fetchImpl: reply.impl,
    });
    assert.equal(
      (reply.calls[0]!.init?.headers as Record<string, string>).authorization,
      `Basic ${Buffer.from("alice:s3cret").toString("base64")}`,
    );
  });

  it("derives the kit profile from signals when the answer omits it", async () => {
    const reply = fetchReply({ choices: [{ message: { content: '{"items":["sonarQualityGate","currentStatus"]}' } }] });
    const layout = await suggestLayoutViaLlm(signals({ sonarQualityGatePath: "/f/sonar.json" }), {
      ...options,
      fetchImpl: reply.impl,
    });
    assert.equal(layout.profile, "kit");
    assert.deepEqual(ids(layout), ["currentStatus", "sonarQualityGate"]);
  });

  it("lets a caller profile override win over the LLM answer", async () => {
    const reply = fetchReply({ choices: [{ message: { content: '{"items":["allureQualityGate"],"profile":"kit"}' } }] });
    await assert.rejects(
      suggestLayoutViaLlm(signals(), { ...options, profile: "default", fetchImpl: reply.impl }),
      /kit-only panel "allureQualityGate"/,
    );
  });

  it("rejects unusable answers", async () => {
    for (const [body, pattern] of [
      [{}, /no message content/],
      [{ choices: [{ message: { content: "" } }] }, /no message content/],
      [{ choices: [{ message: { content: "not json" } }] }, /not JSON/],
      [{ choices: [{ message: { content: '{"items":[]}' } }] }, /no items array/],
      [{ choices: [{ message: { content: '{"items":["currentStatus",7]}' } }] }, /no items array/],
      [{ choices: [{ message: { content: '{"items":["nonsensePanel"]}' } }] }, /unknown panel id "nonsensePanel"/],
      [{ choices: [{ message: { content: '{"items":["currentStatus"],"profile":"weird"}' } }] }, /invalid profile "weird"/],
    ] as const) {
      const reply = fetchReply(body);
      await assert.rejects(
        suggestLayoutViaLlm(signals(), { ...options, fetchImpl: reply.impl }),
        pattern,
      );
    }
  });

  it("rejects http errors, transport failures and timeouts", async () => {
    const server500 = fetchReply({}, { status: 500 });
    await assert.rejects(
      suggestLayoutViaLlm(signals(), { ...options, fetchImpl: server500.impl }),
      /llm http 500/,
    );
    const down = async () => { throw new Error("connection refused"); };
    await assert.rejects(
      suggestLayoutViaLlm(signals(), { ...options, fetchImpl: down as typeof fetch }),
      /connection refused/,
    );
    const hangs = ((_url: unknown, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
    })) as typeof fetch;
    await assert.rejects(
      suggestLayoutViaLlm(signals(), { ...options, timeoutMs: 20, fetchImpl: hangs }),
      /TimeoutError|timed out/i,
    );
  });

  it("caps a crowded answer at seven canonical slots on the wide canvas", async () => {
    const many = {
      choices: [{
        message: {
          content: JSON.stringify({
            items: [
              "currentStatus", "statusDynamics", "testingPyramid", "durationsByLayer",
              "successRateDistribution", "durationDynamics", "statusTransitions",
              "testBaseGrowthDynamics", "currentStatus",
            ],
          }),
        },
      }],
    };
    const layout = await suggestLayoutViaLlm(signals(), { ...options, fetchImpl: fetchReply(many).impl });
    assert.equal(layout.items.length, 7);
    assert.deepEqual(layout.canvas, { w: 1410, h: 1080 });
    assert.equal(ids(layout).includes("testBaseGrowthDynamics"), false);
  });
});
