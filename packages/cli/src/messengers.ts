/**
 * Messenger delivery — Stage D: dry-run / mock only (no network).
 * Live Telegram = ADR 008 / Stage F.
 */

import type { Config } from "@allure-notifications/config";

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

export type DeliveryStatus = "dry-run" | "mocked" | "skipped";

export type DeliveryResult = {
  messenger: MessengerId;
  status: DeliveryStatus;
  detail: string;
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
  /** Prefer dry-run over mock when both set. */
  dryRun: boolean;
  mock: boolean;
  pngBytes: number;
};

/**
 * Record dry-run / mock deliveries. Never opens sockets.
 */
export function deliverMock(
  config: Config,
  opts: DeliverOptions,
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
