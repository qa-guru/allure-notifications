/**
 * allure-notifications — `send --config` (public npm bin for 6.0).
 *
 * Phase 3. Messengers: dry-run / mock by default; live Telegram via `--live` (ADR 008).
 */

export const PACKAGE = "allure-notifications";
export const PHASE = 3;
export { VERSION } from "./cli.js";

export {
  parseArgs,
  helpText,
  type CliCommand,
  type ParsedArgs,
} from "./parse.js";

export {
  configuredMessengers,
  deliver,
  deliverLive,
  deliverMock,
  type DeliveryResult,
  type DeliveryStatus,
  type MessengerId,
} from "./messengers.js";

export {
  ADR008_CHAT_ID,
  FORBIDDEN_CHAT_IDS,
  buildTelegramCaption,
  resolveTelegramCredentials,
  sendTelegramPhoto,
  type SendPhotoResult,
  type TelegramCredentials,
} from "./telegram.js";

export {
  formatConfigValidationError,
  loadConfigFile,
  resolveConfigPaths,
  send,
  type SendOptions,
  type SendResult,
} from "./send.js";

export { runCli, type RunCliResult } from "./cli.js";
