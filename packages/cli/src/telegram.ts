/**
 * Live Telegram sendPhoto adapter (ADR 008).
 * Credentials from env / config — never commit tokens.
 */

import type { Config } from "@allure-notifications/config";
import type { ReportAnalytics } from "@allure-notifications/core";

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

/** Short HTML caption for dogfood / MVP (no FreeMarker). */
export function buildTelegramCaption(
  config: Config,
  analytics?: ReportAnalytics,
): string {
  const base = config.base ?? {};
  const project = base.project?.trim() || "allure-notifications";
  const environment = base.environment?.trim() || "";
  const comment = base.comment?.trim() || "";
  const lines = [`<b>${escapeHtml(project)}</b>`];
  if (environment) {
    lines.push(`<b>environment:</b> ${escapeHtml(environment)}`);
  }
  if (comment) {
    lines.push(`<b>comment:</b> ${escapeHtml(comment)}`);
  }
  if (analytics) {
    const s = analytics.statistic;
    lines.push(
      `<b>total:</b> ${s.total} · passed ${s.passed} · failed ${s.failed} · broken ${s.broken}`,
    );
  }
  lines.push("<i>6.0 TS dogfood · ADR 008</i>");
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
