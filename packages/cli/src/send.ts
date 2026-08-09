/**
 * `send --config` — load config, collage via core, dry-run/mock/live messengers.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import { parseConfig, type Config } from "@qa-guru/allure-notifications-config";
import {
  loadQualityGateCollageData,
  loadReportAnalytics,
  renderCollagePng,
} from "@qa-guru/allure-notifications-core";

import { deliver, type DeliveryResult } from "./messengers.js";
import type { ConfigOverrides } from "./parse.js";

export type SendOptions = {
  configPath: string;
  dryRun?: boolean;
  mock?: boolean;
  /** Live Telegram (ADR 008). Requires explicit --live; never default. */
  live?: boolean;
  out?: string;
  /** Runtime config overrides. Relative folder paths resolve from cwd. */
  overrides?: ConfigOverrides;
  /** Override cwd for relative path resolution (tests). */
  cwd?: string;
  /** Env override for credential resolution / tests. */
  env?: NodeJS.ProcessEnv;
  /** Injectable fetch for live unit tests. */
  fetchImpl?: typeof fetch;
};

export type SendResult = {
  config: Config;
  configPath: string;
  png: Buffer;
  pngPath?: string;
  deliveries: DeliveryResult[];
  dryRun: boolean;
  mock: boolean;
  live: boolean;
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
 * Resolve `base.allureFolder` / `base.allureResultsFolder` / `chart.historyPath`
 * relative to the config file directory (CI-friendly relative paths).
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
  if (base.chart?.historyPath) {
    const historyPath = resolveMaybeRelative(base.chart.historyPath, configDir);
    if (historyPath !== undefined) {
      base.chart = { ...base.chart, historyPath };
    }
  }
  if (base.chart?.allureQualityGatePath) {
    const allureQualityGatePath = resolveMaybeRelative(
      base.chart.allureQualityGatePath,
      configDir,
    );
    if (allureQualityGatePath !== undefined) {
      base.chart = { ...base.chart, allureQualityGatePath };
    }
  }
  if (base.chart?.sonarProjectStatusPath) {
    const sonarProjectStatusPath = resolveMaybeRelative(
      base.chart.sonarProjectStatusPath,
      configDir,
    );
    if (sonarProjectStatusPath !== undefined) {
      base.chart = { ...base.chart, sonarProjectStatusPath };
    }
  }
  return { ...config, base };
}

/**
 * Apply runtime values without rendering a second config file.
 * Folder overrides are consumer-cwd-relative; paths read from config remain
 * config-directory-relative via resolveConfigPaths.
 */
export function applyConfigOverrides(
  config: Config,
  overrides: ConfigOverrides,
  baseDir: string,
): Config {
  const base = { ...config.base };
  const allureFolder = resolveMaybeRelative(overrides.allureFolder, baseDir);
  const allureResultsFolder = resolveMaybeRelative(
    overrides.allureResultsFolder,
    baseDir,
  );
  if (allureFolder !== undefined) {
    base.allureFolder = allureFolder;
  }
  if (allureResultsFolder !== undefined) {
    base.allureResultsFolder = allureResultsFolder;
  }
  if (overrides.project !== undefined) {
    base.project = overrides.project;
  }

  const links = { ...base.links };
  if (overrides.reportUrl !== undefined) {
    links.report = overrides.reportUrl;
  }
  if (overrides.dashboardUrl !== undefined) {
    links.dashboard = overrides.dashboardUrl;
  }
  if (overrides.testopsUrl !== undefined) {
    links.testops = overrides.testopsUrl;
  }
  if (overrides.buildUrl !== undefined) {
    links.build = overrides.buildUrl;
  }
  if (
    overrides.reportUrl !== undefined ||
    overrides.dashboardUrl !== undefined ||
    overrides.testopsUrl !== undefined ||
    overrides.buildUrl !== undefined
  ) {
    base.links = links;
  }

  return { ...config, base };
}

type ZodLikeIssue = { path: PropertyKey[]; message: string };

function isZodLikeError(
  err: unknown,
): err is { issues: ZodLikeIssue[] } {
  return (
    !!err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  );
}

/** Human-readable config validation errors (avoid raw Zod JSON dump). */
export function formatConfigValidationError(
  err: unknown,
  configPath: string,
): Error {
  if (isZodLikeError(err)) {
    const lines = err.issues.map((issue) => {
      const path =
        issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${path}: ${issue.message}`;
    });
    return new Error(
      `invalid config ${configPath}:\n${lines.join("\n")}`,
    );
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

export type LoadConfigOptions = {
  overrides?: ConfigOverrides;
  /** Base directory for runtime path overrides. */
  overrideBaseDir?: string;
};

export async function loadConfigFile(
  configPath: string,
  options: LoadConfigOptions = {},
): Promise<Config> {
  const abs = resolve(configPath);
  const raw = await readFile(abs, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`invalid JSON in ${abs}: ${msg}`);
  }
  try {
    const config = parseConfig(data);
    const resolved = resolveConfigPaths(config, dirname(abs));
    return applyConfigOverrides(
      resolved,
      options.overrides ?? {},
      resolve(options.overrideBaseDir ?? process.cwd()),
    );
  } catch (err) {
    throw formatConfigValidationError(err, abs);
  }
}

/**
 * Render collage PNG and deliver via dry-run / mock / live Telegram.
 * Live path only when `live: true` (CLI `--live`); default remains dry-run.
 */
export async function send(options: SendOptions): Promise<SendResult> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = isAbsolute(options.configPath)
    ? options.configPath
    : resolve(cwd, options.configPath);

  // Priority: dry-run > mock > live > dry-run (safe default).
  const effectiveDryRun =
    options.dryRun === true ||
    (options.mock !== true && options.live !== true);
  const effectiveMock =
    options.mock === true && options.dryRun !== true && options.live !== true;
  const effectiveLive =
    options.live === true &&
    options.dryRun !== true &&
    options.mock !== true;

  const config = await loadConfigFile(configPath, {
    overrides: options.overrides,
    overrideBaseDir: cwd,
  });
  const analytics = await loadReportAnalytics(config);
  const qualityGates = await loadQualityGateCollageData(config);
  const png = await renderCollagePng(config, analytics, qualityGates);

  let pngPath: string | undefined;
  if (options.out) {
    pngPath = isAbsolute(options.out) ? options.out : resolve(cwd, options.out);
    await writeFile(pngPath, png);
  }

  const deliveries = await deliver(config, {
    dryRun: effectiveDryRun,
    mock: effectiveMock,
    live: effectiveLive,
    png,
    pngBytes: png.byteLength,
    analytics,
    env: options.env,
    fetchImpl: options.fetchImpl,
  });

  return {
    config,
    configPath,
    png,
    pngPath,
    deliveries,
    dryRun: effectiveDryRun,
    mock: effectiveMock,
    live: effectiveLive,
  };
}
