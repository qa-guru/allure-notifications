import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";
import { resolvePanelMeta, type SuggestSignals } from "@qa-guru/allure-notifications-config";

import { llmOptionsFromEnv, suggest, suggestLayoutViaLlm } from "../src/index.js";

declareSuite({
  feature: "cli-suggest",
  story: "Optional LLM advisor (tier 1)",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const results = join(repoRoot, "packages/core/test/fixtures/dogfood-results");

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

function ids(layout: { items: Array<{ id?: string; type: string; groupBy?: string; by?: string }> }) {
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

const llmEnv = { ANB_AI_BASE_URL: "https://llm.local/v1/", ANB_AI_MODEL: "test-model" };

describe("llmOptionsFromEnv", () => {
  it("is disabled unless base URL and model are both set", () => {
    assert.equal(llmOptionsFromEnv({}), undefined);
    assert.equal(llmOptionsFromEnv({ ANB_AI_BASE_URL: " http://x " }), undefined);
    assert.equal(llmOptionsFromEnv({ ANB_AI_MODEL: "m", ANB_AI_BASE_URL: "  " }), undefined);
    assert.equal(llmOptionsFromEnv({ ANB_AI_MODEL: " " }), undefined);
  });

  it("normalizes the base URL and trims an optional API key", () => {
    assert.deepEqual(llmOptionsFromEnv(llmEnv), {
      baseUrl: "https://llm.local/v1",
      model: "test-model",
      apiKey: undefined,
    });
    assert.deepEqual(llmOptionsFromEnv({ ...llmEnv, ANB_AI_API_KEY: "  key-1  " }), {
      baseUrl: "https://llm.local/v1",
      model: "test-model",
      apiKey: "key-1",
    });
  });
});

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

describe("suggest with ANB_AI_* env", () => {
  it("uses the LLM pick when the advisor is configured", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-llm-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const reply = fetchReply({
      choices: [{ message: { content: '{"items":["currentStatus","statusDynamics"],"profile":"default"}' } }],
    });
    const result = await suggest({
      cwd: dir,
      resultsFolder: results,
      out: "llm.json",
      env: llmEnv,
      fetchImpl: reply.impl,
    });
    assert.equal(reply.calls.length, 1);
    assert.deepEqual(result.warnings, []);
    const chart = result.config.base.chart!;
    assert.deepEqual(chart.items!.map((item) => resolvePanelMeta(item)!.id), ["currentStatus", "statusDynamics"]);
    assert.equal(chart.width, 870);
    assert.equal(await readFile(result.outPath!, "utf8"), result.json);
  });

  it("warns and falls back to the deterministic scorer on LLM failure", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-llm-fallback-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const down = async () => { throw new Error("connection refused"); };
    const result = await suggest({
      cwd: dir,
      resultsFolder: results,
      env: { ANB_AI_BASE_URL: "https://llm.local/v1", ANB_AI_MODEL: "m" },
      fetchImpl: down as typeof fetch,
    });
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0]!, /llm suggest failed \(connection refused\); using deterministic scorer/);
    const nonError = await suggest({
      cwd: dir,
      resultsFolder: results,
      env: { ANB_AI_BASE_URL: "https://llm.local/v1", ANB_AI_MODEL: "m" },
      fetchImpl: (async () => { throw "plain failure"; }) as typeof fetch,
    });
    assert.match(nonError.warnings[0]!, /llm suggest failed \(plain failure\)/);
    assert.deepEqual(result.config.base.chart!.items!.map((item) => resolvePanelMeta(item)!.id).slice(0, 2), ["currentStatus", "statusDynamics"]);
    assert.equal(result.config.base.chart!.width, 870);
  });

  it("stays fully offline when ANB_AI env is unset", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "an-suggest-no-llm-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await writeFile(join(dir, "input.json"), JSON.stringify({ base: { chart: { profile: "kit" } } }));
    const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("network forbidden"); });
    const result = await suggest({
      cwd: dir,
      resultsFolder: results,
      configPath: "input.json",
      env: {},
    });
    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(result.config.base.chart?.profile, "kit");
    assert.deepEqual(result.warnings, []);
  });
});
