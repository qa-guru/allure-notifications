import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";
import { resolvePanelMeta } from "@qa-guru/allure-notifications-config";

import { llmOptionsFromEnv, suggest } from "../src/index.js";

declareSuite({
  feature: "cli-suggest",
  story: "Optional LLM advisor (tier 1)",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const results = join(repoRoot, "packages/core/test/fixtures/dogfood-results");

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
      timeoutMs: undefined,
    });
    assert.deepEqual(llmOptionsFromEnv({ ...llmEnv, ANB_AI_API_KEY: "  key-1  " }), {
      baseUrl: "https://llm.local/v1",
      model: "test-model",
      apiKey: "key-1",
      timeoutMs: undefined,
    });
  });

  it("parses ANB_AI_TIMEOUT_MS and ignores invalid values", () => {
    assert.equal(llmOptionsFromEnv({ ...llmEnv, ANB_AI_TIMEOUT_MS: "120000" })?.timeoutMs, 120000);
    assert.equal(llmOptionsFromEnv({ ...llmEnv, ANB_AI_TIMEOUT_MS: "later" })?.timeoutMs, undefined);
    assert.equal(llmOptionsFromEnv({ ...llmEnv, ANB_AI_TIMEOUT_MS: "0" })?.timeoutMs, undefined);
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
