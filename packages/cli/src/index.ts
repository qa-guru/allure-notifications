/**
 * @allure-notifications/cli — `allure-notifications send --config`.
 *
 * Phase 3. Messengers: dry-run / mock by default; live Telegram via `--live` (ADR 008).
 */

export const PACKAGE = "@allure-notifications/cli";
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
  loadConfigFile,
  resolveConfigPaths,
  send,
  type SendOptions,
  type SendResult,
} from "./send.js";

export { runCli, type RunCliResult } from "./cli.js";
