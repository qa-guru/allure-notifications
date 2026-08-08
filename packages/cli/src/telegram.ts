/**
 * Live Telegram sendPhoto adapter (ADR 008).
 * Credentials from env / config — never commit tokens.
 */

import {
  captionPhrasesFor,
  type CaptionPhrases,
  type Config,
} from "@qa-guru/allure-notifications-config";
import type { ReportAnalytics } from "@qa-guru/allure-notifications-core";

/** ADR 008 monitoring forum chat. */
export const ADR008_CHAT_ID = "-1004381150566";

/** Retired dogfood chat — refuse live send (ADR 008). */
export const FORBIDDEN_CHAT_IDS = new Set(["-1001587609458"]);

export type TelegramCredentials = {
  token: string;
  chat: string;
  topic?: string;
  replyTo?: string;
};

export type ResolveCredentialsOptions = {
  config: Config;
  env?: NodeJS.ProcessEnv;
  /** When true (default), empty chat falls back to ADR 008 forum. */
  applyAdrDefaults?: boolean;
};

function nonEmpty(value: string | undefined | null): string | undefined {
  if (value == null) {
    return undefined;
  }
  const t = value.trim();
  return t ? t : undefined;
}

/**
 * Resolve Telegram credentials: env overrides config; ADR 008 defaults for chat/topic.
 *
 * Env (ADR 008 / etalon):
 * - `TELEGRAM_BOT_TOKEN` or `TELEGRAM_TOKEN`
 * - `TELEGRAM_CHAT_ID` (fallback ADR 008 forum)
 * - `TELEGRAM_TOPIC_ID` or `TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID`
 */
export function resolveTelegramCredentials(
  opts: ResolveCredentialsOptions,
): TelegramCredentials {
  const env = opts.env ?? process.env;
  const tg = opts.config.telegram ?? {};
  const applyAdr = opts.applyAdrDefaults !== false;

  const token =
    nonEmpty(env.TELEGRAM_BOT_TOKEN) ??
    nonEmpty(env.TELEGRAM_TOKEN) ??
    nonEmpty(tg.token);

  const chat =
    nonEmpty(env.TELEGRAM_CHAT_ID) ??
    nonEmpty(tg.chat) ??
    (applyAdr ? ADR008_CHAT_ID : undefined);

  const topic =
    nonEmpty(env.TELEGRAM_TOPIC_ID) ??
    nonEmpty(env.TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID) ??
    nonEmpty(tg.topic);

  const replyTo = nonEmpty(tg.replyTo);

  if (!token) {
    throw new Error(
      "live Telegram requires TELEGRAM_BOT_TOKEN (or TELEGRAM_TOKEN) or config.telegram.token",
    );
  }
  if (!chat) {
    throw new Error(
      "live Telegram requires TELEGRAM_CHAT_ID or config.telegram.chat",
    );
  }
  if (FORBIDDEN_CHAT_IDS.has(chat)) {
    throw new Error(
      `refusing live send to retired dogfood chat ${chat} — use ADR 008 Monitoring ${ADR008_CHAT_ID}`,
    );
  }

  return { token, chat, topic, replyTo };
}

/** Format ms as HH:mm:ss.SSS (Java DurationFormatUtils parity). */
export function formatDurationMs(
  durationMs: number,
  pattern = "HH:mm:ss.SSS",
): string {
  const ms = Math.max(0, Math.floor(durationMs));
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  return pattern
    .replace("HH", pad(hours, 2))
    .replace("mm", pad(minutes, 2))
    .replace("ss", pad(seconds, 2))
    .replace("SSS", pad(millis, 3));
}

function printPercentage(part: number, total: number): string {
  if (total <= 0) return "(0 %)";
  const pct = (part * 100) / total;
  const rounded = Math.round(pct * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return `(${text} %)`;
}

const LINK_KEYS = ["report", "dashboard", "testops", "build"] as const;

function boldLabel(label: string, value: string): string {
  return `<b>${escapeHtml(label)}: </b>${value}`;
}

function statisticCaptionLines(
  phrases: CaptionPhrases,
  analytics: ReportAnalytics,
  durationFormat: string,
): string[] {
  const s = analytics.statistic;
  const durationMs =
    analytics.durationMs > 0
      ? analytics.durationMs
      : analytics.durationsMs.reduce((a, b) => a + b, 0);
  const lines = [
    boldLabel(phrases.duration, escapeHtml(formatDurationMs(durationMs, durationFormat))),
    boldLabel(phrases.totalScenarios, String(s.total)),
  ];
  const optional: Array<[number, string, string]> = [
    [s.passed, phrases.totalPassed, `${s.passed} ${printPercentage(s.passed, s.total)}`],
    [s.failed, phrases.totalFailed, `${s.failed} ${printPercentage(s.failed, s.total)}`],
    [s.broken, phrases.totalBroken, String(s.broken)],
    [s.unknown, phrases.totalUnknown, String(s.unknown)],
    [s.skipped, phrases.totalSkipped, String(s.skipped)],
  ];
  for (const [count, label, value] of optional) {
    if (count !== 0) lines.push(boldLabel(label, value));
  }
  return lines;
}

function linkCaptionLines(
  phrases: CaptionPhrases,
  links: NonNullable<NonNullable<Config["base"]>["links"]>,
): string[] {
  const out: string[] = [];
  for (const key of LINK_KEYS) {
    const href = nonEmpty(links[key]);
    if (!href) continue;
    const label = phrases.links[key];
    out.push(
      `<b>${escapeHtml(label)}:</b> <a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`,
    );
  }
  return out;
}

/**
 * HTML caption for Telegram sendPhoto — FreeMarker `telegram.ftl` parity
 * (environment / stats / duration / links). No FreeMarker runtime.
 */
export function buildTelegramCaption(
  config: Config,
  analytics?: ReportAnalytics,
): string {
  const base = config.base ?? {};
  const phrases = captionPhrasesFor(base.language);
  const environment = base.environment?.trim() || "";
  const comment = base.comment?.trim() || "";
  const durationFormat = base.durationFormat?.trim() || "HH:mm:ss.SSS";
  const lines: string[] = [`<b>${escapeHtml(phrases.results)}:</b>`];

  if (environment) {
    lines.push(boldLabel(phrases.environment, escapeHtml(environment)));
  }
  if (comment) {
    lines.push(boldLabel(phrases.comment, escapeHtml(comment)));
  }
  if (analytics) {
    lines.push(...statisticCaptionLines(phrases, analytics, durationFormat));
  }
  lines.push(...linkCaptionLines(phrases, base.links ?? {}));

  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type SendPhotoOptions = {
  credentials: TelegramCredentials;
  png: Buffer;
  caption: string;
  /** Injectable for unit tests (default: global fetch). */
  fetchImpl?: typeof fetch;
  apiBase?: string;
};

export type SendPhotoResult = {
  ok: true;
  messageId: number;
  chatId: number | string;
  messageThreadId?: number;
};

/**
 * Bot API `sendPhoto` (multipart). Returns message id — never logs the token.
 */
export async function sendTelegramPhoto(
  opts: SendPhotoOptions,
): Promise<SendPhotoResult> {
  const { credentials, png, caption } = opts;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const apiBase = opts.apiBase ?? "https://api.telegram.org";
  const url = `${apiBase}/bot${credentials.token}/sendPhoto`;

  const form = new FormData();
  form.append("chat_id", credentials.chat);
  form.append(
    "photo",
    new Blob([new Uint8Array(png)], { type: "image/png" }),
    "chart.png",
  );
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  if (credentials.topic) {
    form.append("message_thread_id", credentials.topic);
  }
  if (credentials.replyTo) {
    form.append("reply_to_message_id", credentials.replyTo);
  }

  const res = await fetchImpl(url, { method: "POST", body: form });
  const body = (await res.json()) as {
    ok?: boolean;
    description?: string;
    result?: {
      message_id?: number;
      message_thread_id?: number;
      chat?: { id?: number | string };
    };
  };

  if (!res.ok || !body.ok || body.result?.message_id == null) {
    const detail = body.description ?? `HTTP ${res.status}`;
    throw new Error(`Telegram sendPhoto failed: ${detail}`);
  }

  return {
    ok: true,
    messageId: body.result.message_id,
    chatId: body.result.chat?.id ?? credentials.chat,
    messageThreadId: body.result.message_thread_id,
  };
}
