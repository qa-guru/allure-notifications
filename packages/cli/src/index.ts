/**
 * @allure-notifications/cli — `allure-notifications send --config`.
 *
 * Phase 3 / Stage D. Messengers: dry-run / mock only (no live Telegram).
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
  deliverMock,
  type DeliveryResult,
  type DeliveryStatus,
  type MessengerId,
} from "./messengers.js";

export {
  loadConfigFile,
  resolveConfigPaths,
  send,
  type SendOptions,
  type SendResult,
} from "./send.js";

export { runCli, type RunCliResult } from "./cli.js";
