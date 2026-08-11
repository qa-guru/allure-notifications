/**
 * Messenger delivery — dry-run / mock (default) + live Telegram (ADR 008).
 */

import type { Config } from "@qa-guru/allure-notifications-config";
import type { ReportAnalytics } from "@qa-guru/allure-notifications-core";

import { resolveLiveFetch } from "./proxy.js";
import {
  buildTelegramCaption,
  resolveTelegramCredentials,
  sendTelegramPhoto,
  type SendPhotoResult,
} from "./telegram.js";

export type MessengerId =
  | "telegram"
  | "slack"
  | "mattermost"
  | "mail"
  | "discord"
  | "loop"
  | "rocketChat"
  | "cliq"
  | "teams";

export type DeliveryStatus = "dry-run" | "mocked" | "skipped" | "sent";

export type DeliveryResult = {
  messenger: MessengerId;
  status: DeliveryStatus;
  detail: string;
  /** Present when status === "sent" (Telegram). */
  messageId?: number;
  chatId?: number | string;
  messageThreadId?: number;
};

const MESSENGER_KEYS: MessengerId[] = [
  "telegram",
  "slack",
  "mattermost",
  "mail",
  "discord",
  "loop",
  "rocketChat",
  "cliq",
  "teams",
];

/** Messengers present as non-empty objects on config. */
export function configuredMessengers(config: Config): MessengerId[] {
  const root = config as Record<string, unknown>;
  const found: MessengerId[] = [];
  for (const key of MESSENGER_KEYS) {
    const block = root[key];
    if (block && typeof block === "object" && !Array.isArray(block)) {
      found.push(key);
    }
  }
  return found;
}

export type DeliverOptions = {
  /** Prefer dry-run over mock / live when both set. */
  dryRun: boolean;
  mock: boolean;
  live: boolean;
  png: Buffer;
  pngBytes: number;
  analytics?: ReportAnalytics;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
};

/**
 * Record dry-run / mock deliveries. Never opens sockets.
 */
export function deliverMock(
  config: Config,
  opts: Pick<DeliverOptions, "dryRun" | "mock" | "pngBytes">,
): DeliveryResult[] {
  const messengers = configuredMessengers(config);
  if (messengers.length === 0) {
    return [
      {
        messenger: "telegram",
        status: "skipped",
        detail: "no messengers configured in config.json",
      },
    ];
  }

  const status: DeliveryStatus = opts.dryRun ? "dry-run" : "mocked";
  return messengers.map((messenger) => ({
    messenger,
    status,
    detail:
      status === "dry-run"
        ? `would send collage PNG (${opts.pngBytes} bytes) — no network`
        : `mock delivery ok — collage PNG (${opts.pngBytes} bytes), no network`,
  }));
}

/**
 * Live Telegram delivery (ADR 008). Other messengers → skipped.
 */
export async function deliverLive(
  config: Config,
  opts: DeliverOptions,
): Promise<DeliveryResult[]> {
  const messengers = configuredMessengers(config);
  if (messengers.length === 0) {
    return [
      {
        messenger: "telegram",
        status: "skipped",
        detail: "no messengers configured in config.json",
      },
    ];
  }

  const results: DeliveryResult[] = [];
  for (const messenger of messengers) {
    if (messenger !== "telegram") {
      results.push({
        messenger,
        status: "skipped",
        detail: "live delivery not implemented for this messenger",
      });
      continue;
    }

    const credentials = resolveTelegramCredentials({
      config,
      env: opts.env,
    });
    const caption = buildTelegramCaption(config, opts.analytics);
    const fetchImpl = resolveLiveFetch({
      configProxy: (config as { proxy?: unknown }).proxy,
      fetchImpl: opts.fetchImpl,
      env: opts.env,
    });
    const sent: SendPhotoResult = await sendTelegramPhoto({
      credentials,
      png: opts.png,
      caption,
      fetchImpl,
    });

    const topicPart =
      sent.messageThreadId != null
        ? ` topic=${sent.messageThreadId}`
        : credentials.topic
          ? ` topic=${credentials.topic}`
          : "";
    results.push({
      messenger: "telegram",
      status: "sent",
      detail: `sendPhoto ok — message_id=${sent.messageId} chat=${sent.chatId}${topicPart} (${opts.pngBytes} bytes)`,
      messageId: sent.messageId,
      chatId: sent.chatId,
      messageThreadId: sent.messageThreadId,
    });
  }
  return results;
}

/**
 * Route delivery: dry-run / mock (sync, no network) or live Telegram.
 * Caller must set mutually exclusive effective flags (see `send`).
 */
export async function deliver(
  config: Config,
  opts: DeliverOptions,
): Promise<DeliveryResult[]> {
  if (opts.live && !opts.dryRun && !opts.mock) {
    return deliverLive(config, opts);
  }
  return deliverMock(config, {
    dryRun: opts.dryRun,
    mock: opts.mock && !opts.dryRun,
    pngBytes: opts.pngBytes,
  });
}
