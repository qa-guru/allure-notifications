/**
 * Optional tier-1 advisor (ADR 020): an OpenAI-compatible chat endpoint picks
 * catalog panel ids from compact signals. The output is validated against
 * PANEL_META and materialized into canonical templates — the LLM can never
 * invent coordinates. Any failure must be caught by the caller, which falls
 * back to the deterministic scorer.
 *
 * Browser-safe: fetch is injected by the caller (CLI env / builder form), so
 * CLI and apps/builder run literally the same code — the prompts, validation
 * and layout materialization cannot diverge.
 */
import { PANEL_META } from "./catalog.js";
import { isKitOnlyPanelId } from "./kit-only.js";
import { materializeLayout, suggestLayout, } from "./suggest.js";
const DEFAULT_TIMEOUT_MS = 15000;
const VALID_PROFILES = new Set(["default", "kit"]);
function systemPrompt() {
    return [
        "You pick panel ids for an Allure test-report collage config.",
        'Reply with a JSON object only: {"items": ["<panel id>", ...], "profile": "default"|"kit"}.',
        "1-7 items, each from this catalog:",
        Object.keys(PANEL_META).join(", "),
        'allureQualityGate, sonarQualityGate and testsTable require profile "kit".',
        "Lead with currentStatus; use history panels only when historyRunCount >= 2.",
    ].join("\n");
}
function extractContent(payload) {
    const message = payload
        ?.choices?.[0]?.message;
    if (typeof message?.content !== "string" || !message.content.trim()) {
        throw new Error("llm response has no message content");
    }
    return message.content;
}
function parseAnswer(content) {
    const text = content.trim()
        .replace(/^```(?:json)?[ \t]*\r?\n?/i, "")
        .replace(/\r?\n?[ \t]*```$/, "");
    let raw;
    try {
        raw = JSON.parse(text);
    }
    catch {
        throw new Error("llm answer is not JSON");
    }
    const answer = raw;
    if (!Array.isArray(answer.items) || answer.items.length === 0
        || !answer.items.every((id) => typeof id === "string" && id.length > 0)) {
        throw new Error("llm answer has no items array");
    }
    if (answer.profile !== undefined && !VALID_PROFILES.has(answer.profile)) {
        throw new Error(`llm answer has invalid profile "${String(answer.profile)}"`);
    }
    return { items: answer.items, profile: answer.profile };
}
function validateItems(ids, profile) {
    for (const id of ids) {
        if (!PANEL_META[id])
            throw new Error(`llm suggested unknown panel id "${id}"`);
        if (profile !== "kit" && isKitOnlyPanelId(id)) {
            throw new Error(`llm suggested kit-only panel "${id}" under profile "${profile}"`);
        }
    }
}
export async function suggestLayoutViaLlm(signals, options) {
    const fetchImpl = options.fetchImpl ?? fetch;
    const apiKey = options.apiKey;
    // "user:pass" → HTTP Basic (ollama-box2 qa.guru); anything else → Bearer.
    const authorization = apiKey
        ? apiKey.includes(":")
            ? `Basic ${btoa(apiKey)}`
            : `Bearer ${apiKey}`
        : undefined;
    const response = await fetchImpl(`${options.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            ...(authorization ? { authorization } : {}),
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
    if (!response.ok)
        throw new Error(`llm http ${response.status}`);
    const answer = parseAnswer(extractContent(await response.json()));
    const profile = options.profile ?? answer.profile ?? suggestLayout(signals).profile;
    validateItems(answer.items, profile);
    return materializeLayout(answer.items, profile);
}
