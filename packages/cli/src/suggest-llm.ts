/**
 * Tier-1 advisor wiring for the CLI (ADR 020). The advisor itself lives in
 * `@qa-guru/allure-notifications-config` and is shared with apps/builder —
 * one prompt, one validation, one materialization, so both paths cannot
 * diverge. This file only owns the env contract (`ANB_AI_*`).
 */

export {
  suggestLayoutViaLlm,
  type LlmOptions,
} from "@qa-guru/allure-notifications-config";

import type { LlmOptions } from "@qa-guru/allure-notifications-config";

/** Env contract (ADR 020): disabled unless base URL and model are both set. */
export function llmOptionsFromEnv(
  env: Partial<
    Record<
      "ANB_AI_BASE_URL" | "ANB_AI_MODEL" | "ANB_AI_API_KEY" | "ANB_AI_TIMEOUT_MS",
      string | undefined
    >
  >,
): LlmOptions | undefined {
  const baseUrl = env.ANB_AI_BASE_URL?.trim();
  const model = env.ANB_AI_MODEL?.trim();
  if (!baseUrl || !model) return undefined;
  const timeoutMs = Number(env.ANB_AI_TIMEOUT_MS);
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model,
    apiKey: env.ANB_AI_API_KEY?.trim() || undefined,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined,
  };
}
