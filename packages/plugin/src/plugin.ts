/**
 * Allure 3 plugin — thin wrapper over config/core + CLI messengers.
 *
 * Etalon: @allurereport/plugin-slack `done` hook.
 * Collage PNG via @napi-rs/canvas (core); never Playwright.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import { parseConfig, type Config } from "@allure-notifications/config";
import {
  loadReportAnalytics,
  renderCollagePng,
  type ReportAnalytics,
} from "@allure-notifications/core";
import type { AllureStore, Plugin, PluginContext } from "@allurereport/plugin-api";
import {
  deliver,
  resolveConfigPaths,
  type DeliveryResult,
} from "allure-notifications";

export const PACKAGE = "@allure-notifications/plugin";
export const PHASE = 5;

export type NotificationsPluginMode = "dry-run" | "mock" | "live";

export type NotificationsPluginOptions = {
  /**
   * Path to `config.json` (relative to `cwd`) or inline config object.
   * Same schema as CLI `send --config`.
   */
  config: string | Record<string, unknown>;
  /**
   * Delivery mode. Default: `dry-run` (no network).
   * `live` → Telegram sendPhoto (ADR 008) via CLI messengers.
   */
  mode?: NotificationsPluginMode;
  /** Write collage PNG to disk. */
  out?: string;
  /**
   * Override `base.allureFolder`. When omitted and config has no folder,
   * falls back to `PluginContext.output` (Allure report dir).
   */
  allureFolder?: string;
  /** Override `base.allureResultsFolder`. */
  allureResultsFolder?: string;
  /** Attach collage into the generated report as this relative path. */
  reportFile?: string | false;
  /** Override cwd for relative path resolution (tests). */
  cwd?: string;
  /** Env override for credential resolution / tests. */
  env?: NodeJS.ProcessEnv;
  /** Injectable fetch for live unit tests. */
  fetchImpl?: typeof fetch;
};

export type NotificationsPluginResult = {
  config: Config;
  png: Buffer;
  pngPath?: string;
  deliveries: DeliveryResult[];
  mode: NotificationsPluginMode;
  analytics: ReportAnalytics;
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

function effectiveMode(mode: NotificationsPluginMode | undefined): {
  mode: NotificationsPluginMode;
  dryRun: boolean;
  mock: boolean;
  live: boolean;
} {
  const resolved: NotificationsPluginMode =
    mode === "mock" || mode === "live" ? mode : "dry-run";
  return {
    mode: resolved,
    dryRun: resolved === "dry-run",
    mock: resolved === "mock",
    live: resolved === "live",
  };
}

type ZodLikeIssue = { path: PropertyKey[]; message: string };

function isZodLikeError(err: unknown): err is { issues: ZodLikeIssue[] } {
  return (
    !!err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  );
}

function formatConfigValidationError(err: unknown, label: string): Error {
  if (isZodLikeError(err)) {
    const lines = err.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${path}: ${issue.message}`;
    });
    return new Error(`invalid config ${label}:\n${lines.join("\n")}`);
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

async function loadPluginConfig(
  options: NotificationsPluginOptions,
  cwd: string,
): Promise<Config> {
  const raw = options.config;
  if (typeof raw === "string") {
    const configPath = isAbsolute(raw) ? raw : resolve(cwd, raw);
    const text = await readFile(configPath, "utf8");
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`invalid JSON in ${configPath}: ${msg}`);
    }
    try {
      return resolveConfigPaths(parseConfig(data), dirname(configPath));
    } catch (err) {
      throw formatConfigValidationError(err, configPath);
    }
  }

  try {
    return resolveConfigPaths(parseConfig(raw), cwd);
  } catch (err) {
    throw formatConfigValidationError(err, "(inline options.config)");
  }
}

function applyFolderOverrides(
  config: Config,
  options: NotificationsPluginOptions,
  context: PluginContext,
  cwd: string,
): Config {
  const base = { ...config.base };
  const allureFolder =
    resolveMaybeRelative(options.allureFolder, cwd) ??
    base.allureFolder ??
    context.output;
  const allureResultsFolder =
    resolveMaybeRelative(options.allureResultsFolder, cwd) ??
    base.allureResultsFolder;

  if (allureFolder) {
    base.allureFolder = allureFolder;
  }
  if (allureResultsFolder) {
    base.allureResultsFolder = allureResultsFolder;
  }
  return { ...config, base };
}

/**
 * Parse config → collage PNG (core) → messengers (CLI). Safe default = dry-run.
 */
export async function runNotificationsPlugin(
  context: PluginContext,
  options: NotificationsPluginOptions,
): Promise<NotificationsPluginResult> {
  if (options.config == null) {
    throw new Error(
      `${PACKAGE}: options.config is required (path or inline object)`,
    );
  }

  const cwd = options.cwd ?? process.cwd();
  const { mode, dryRun, mock, live } = effectiveMode(options.mode);

  let config = await loadPluginConfig(options, cwd);
  config = applyFolderOverrides(config, options, context, cwd);

  const analytics = await loadReportAnalytics(config);
  const png = await renderCollagePng(config, analytics);

  let pngPath: string | undefined;
  if (options.out) {
    pngPath = isAbsolute(options.out) ? options.out : resolve(cwd, options.out);
    await writeFile(pngPath, png);
  }

  if (options.reportFile !== false) {
    const reportName =
      typeof options.reportFile === "string" && options.reportFile.trim()
        ? options.reportFile.trim()
        : "allure-notifications-collage.png";
    await context.reportFiles.addFile(reportName, png);
  }

  const deliveries = await deliver(config, {
    dryRun,
    mock,
    live,
    png,
    pngBytes: png.byteLength,
    analytics,
    env: options.env,
    fetchImpl: options.fetchImpl,
  });

  return { config, png, pngPath, deliveries, mode, analytics };
}

export class NotificationsPlugin implements Plugin {
  constructor(readonly options: NotificationsPluginOptions) {}

  done = async (
    context: PluginContext,
    _store: AllureStore,
  ): Promise<void> => {
    await runNotificationsPlugin(context, this.options);
  };
}
