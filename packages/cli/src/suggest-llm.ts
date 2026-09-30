/**
 * Optional tier-1 advisor (ADR 020): an OpenAI-compatible chat endpoint picks
 * catalog panel ids from compact signals. The output is validated against
 * PANEL_META and materialized into canonical templates — the LLM can never
 * invent coordinates. Any failure must be caught by the caller, which falls
 * back to the deterministic scorer.
 */

import {
  isKitOnlyPanelId,
  materializeLayout,
  PANEL_META,
  suggestLayout,
  type ChartProfile,
  type SuggestedLayout,
  type SuggestSignals,
} from "@qa-guru/allure-notifications-config";

export type LlmOptions = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  /** Caller-forced profile (`--profile` / existing kit config) — wins over the LLM answer. */
  profile?: ChartProfile;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 15000;
const VALID_PROFILES: ReadonlySet<string> = new Set(["default", "kit"]);

/** Env contract (ADR 020): disabled unless base URL and model are both set. */
export function llmOptionsFromEnv(
  env: Partial<Record<"ANB_AI_BASE_URL" | "ANB_AI_MODEL" | "ANB_AI_API_KEY", string | undefined>>,
): LlmOptions | undefined {
  const baseUrl = env.ANB_AI_BASE_URL?.trim();
  const model = env.ANB_AI_MODEL?.trim();
  if (!baseUrl || !model) return undefined;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model,
    apiKey: env.ANB_AI_API_KEY?.trim() || undefined,
  };
}

function systemPrompt(): string {
  return [
    "You pick panel ids for an Allure test-report collage config.",
    'Reply with a JSON object only: {"items": ["<panel id>", ...], "profile": "default"|"kit"}.',
    "1-7 items, each from this catalog:",
    Object.keys(PANEL_META).join(", "),
    'allureQualityGate, sonarQualityGate and testsTable require profile "kit".',
    "Lead with currentStatus; use history panels only when historyRunCount >= 2.",
  ].join("\n");
}

type LlmAnswer = { items: string[]; profile?: ChartProfile };

function extractContent(payload: unknown): string {
  const message = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message;
  if (typeof message?.content !== "string" || !message.content.trim()) {
    throw new Error("llm response has no message content");
  }
  return message.content;
}

function parseAnswer(content: string): LlmAnswer {
  const text = content.trim()
    .replace(/^```(?:json)?[ \t]*\r?\n?/i, "")
    .replace(/\r?\n?[ \t]*```$/, "");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("llm answer is not JSON");
  }
  const answer = raw as { items?: unknown; profile?: unknown };
  if (!Array.isArray(answer.items) || answer.items.length === 0
    || !answer.items.every((id) => typeof id === "string" && id.length > 0)) {
    throw new Error("llm answer has no items array");
  }
  if (answer.profile !== undefined && !VALID_PROFILES.has(answer.profile as string)) {
    throw new Error(`llm answer has invalid profile "${String(answer.profile)}"`);
  }
  return { items: answer.items as string[], profile: answer.profile as ChartProfile | undefined };
}

function validateItems(ids: readonly string[], profile: ChartProfile): void {
  for (const id of ids) {
    if (!PANEL_META[id]) throw new Error(`llm suggested unknown panel id "${id}"`);
    if (profile !== "kit" && isKitOnlyPanelId(id)) {
      throw new Error(`llm suggested kit-only panel "${id}" under profile "${profile}"`);
    }
  }
}

export async function suggestLayoutViaLlm(
  signals: SuggestSignals,
  options: LlmOptions,
): Promise<SuggestedLayout> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(`${options.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: JSON.stringify(signals) },
      ],
    }),
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`llm http ${response.status}`);
  const answer = parseAnswer(extractContent(await response.json()));
  const profile = options.profile ?? answer.profile ?? suggestLayout(signals).profile;
  validateItems(answer.items, profile);
  return materializeLayout(answer.items, profile);
}
