/**
 * `send --config` — load config, collage via core, dry-run/mock messengers.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import { parseConfig, type Config } from "@allure-notifications/config";
import {
  loadReportAnalytics,
  renderCollagePng,
} from "@allure-notifications/core";

import { deliverMock, type DeliveryResult } from "./messengers.js";

export type SendOptions = {
  configPath: string;
  dryRun?: boolean;
  mock?: boolean;
  out?: string;
  /** Override cwd for relative path resolution (tests). */
  cwd?: string;
};

export type SendResult = {
  config: Config;
  configPath: string;
  png: Buffer;
  pngPath?: string;
  deliveries: DeliveryResult[];
  dryRun: boolean;
  mock: boolean;
};

function resolveMaybeRelative(
  value: string | undefined,
  baseDir: string,
): string | undefined {
  if (value == null || !value.trim()) {
    return value;
  }
  if (isAbsolute(value)) {
    return value;
  }
  return resolve(baseDir, value);
}

/**
 * Resolve `base.allureFolder` / `base.allureResultsFolder` relative to the
 * config file directory (CI-friendly relative paths).
 */
export function resolveConfigPaths(config: Config, configDir: string): Config {
  const base = { ...config.base };
  const allureFolder = resolveMaybeRelative(base.allureFolder, configDir);
  const allureResultsFolder = resolveMaybeRelative(
    base.allureResultsFolder,
    configDir,
  );
  if (allureFolder !== undefined) {
    base.allureFolder = allureFolder;
  }
  if (allureResultsFolder !== undefined) {
    base.allureResultsFolder = allureResultsFolder;
  }
  return { ...config, base };
}

export async function loadConfigFile(configPath: string): Promise<Config> {
  const abs = resolve(configPath);
  const raw = await readFile(abs, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`invalid JSON in ${abs}: ${msg}`);
  }
  const config = parseConfig(data);
  return resolveConfigPaths(config, dirname(abs));
}

/**
 * Render collage PNG and dry-run/mock messenger delivery.
 * Never performs live Telegram / HTTP send (Stage D / ADR 008).
 */
export async function send(options: SendOptions): Promise<SendResult> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = isAbsolute(options.configPath)
    ? options.configPath
    : resolve(cwd, options.configPath);

  // dry-run wins when both; neither → dry-run (safe Stage D default).
  const effectiveDryRun = options.dryRun === true || options.mock !== true;
  const effectiveMock = options.mock === true && options.dryRun !== true;

  const config = await loadConfigFile(configPath);
  const analytics = await loadReportAnalytics(config);
  const png = await renderCollagePng(config, analytics);

  let pngPath: string | undefined;
  if (options.out) {
    pngPath = isAbsolute(options.out) ? options.out : resolve(cwd, options.out);
    await writeFile(pngPath, png);
  }

  const deliveries = deliverMock(config, {
    dryRun: effectiveDryRun,
    mock: effectiveMock,
    pngBytes: png.byteLength,
  });

  return {
    config,
    configPath,
    png,
    pngPath,
    deliveries,
    dryRun: effectiveDryRun,
    mock: effectiveMock,
  };
}
