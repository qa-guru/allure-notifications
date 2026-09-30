/**
 * Minimal argv parser for `allure-notifications send --config …`.
 * No external CLI framework — keeps Stage D deps thin.
 */

import type { ChartProfile } from "@qa-guru/allure-notifications-config";

export type CliCommand = "send" | "suggest" | "help" | "version";

export type ConfigOverrides = {
  allureFolder?: string;
  allureResultsFolder?: string;
  project?: string;
  reportUrl?: string;
  dashboardUrl?: string;
  testopsUrl?: string;
  buildUrl?: string;
};

export type ParsedArgs = ConfigOverrides & {
  command: CliCommand;
  configPath?: string;
  resultsFolder?: string;
  profile?: ChartProfile;
  dryRun: boolean;
  mock: boolean;
  live: boolean;
  out?: string;
  errors: string[];
};

const HELP_TEXT = `allure-notifications — Allure report → messenger notifications (6.0)

Usage:
  allure-notifications send --config <path> [overrides] [--dry-run|--mock|--live] [--out <png>]
  allure-notifications suggest --results <dir> [--profile default|kit] [--config <path>] [--out <json>]

Options:
  --config <path>                  Config JSON (required for send; optional facts for suggest)
  --results <dir>                  Allure results directory (required for suggest)
  --profile default|kit            Suggest profile override (auto if omitted)
  --write <path>                   Alias for suggest --out (new file only)
  --allure-folder <path>           Override base.allureFolder (cwd-relative)
  --allure-results-folder <path>   Override base.allureResultsFolder (cwd-relative)
  --project <name>                 Override base.project
  --report-url <url>               Override base.links.report
  --dashboard-url <url>            Override base.links.dashboard
  --testops-url <url>              Override base.links.testops
  --build-url <url>                Override base.links.build
  --dry-run                        Render collage; skip network I/O (send only, default)
  --mock                           Render collage; mock deliveries (send only, no network)
  --live                           Live Telegram send; needs env credentials (send only)
  --out <path>                     Write PNG (send) or new config JSON (suggest), cwd-relative
  -h, --help                       Show help
  -V, --version                    Show version

Suggest is offline: prints config JSON for review; --out/--write create a new file instead.
Optional AI advisor (suggest only): ANB_AI_BASE_URL + ANB_AI_MODEL (+ ANB_AI_API_KEY)
enable an OpenAI-compatible LLM panel pick; any error falls back to the
deterministic scorer. Disabled when env is unset.
Live credentials (env overrides config): TELEGRAM_BOT_TOKEN | TELEGRAM_TOKEN,
TELEGRAM_CHAT_ID, TELEGRAM_TOPIC_ID. See docs/telegram-dogfood.md.
`;

type ValueOption =
  | "configPath"
  | "out"
  | "resultsFolder"
  | "profile"
  | keyof ConfigOverrides;

const VALUE_OPTIONS: Record<string, ValueOption> = {
  "--config": "configPath",
  "-c": "configPath",
  "--out": "out",
  "-o": "out",
  "--write": "out",
  "--results": "resultsFolder",
  "--profile": "profile",
  "--allure-folder": "allureFolder",
  "--allure-results-folder": "allureResultsFolder",
  "--project": "project",
  "--report-url": "reportUrl",
  "--dashboard-url": "dashboardUrl",
  "--testops-url": "testopsUrl",
  "--build-url": "buildUrl",
};

export function helpText(): string {
  return HELP_TEXT;
}

/**
 * Parse process argv (without `node` / script path).
 * Accepts either full argv (`process.argv.slice(2)`) or test arrays.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const errors: string[] = [];
  let command: CliCommand | undefined;
  let dryRun = false;
  let mock = false;
  let live = false;
  const values: Partial<Record<ValueOption, string>> = {};
  const usedOptions = new Set<string>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "send" || arg === "suggest" || arg === "help" || arg === "version") {
      if (command != null && command !== arg) {
        errors.push(`unexpected command "${arg}" after "${command}"`);
      } else {
        command = arg;
      }
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      command = "help";
      continue;
    }
    if (arg === "-V" || arg === "--version") {
      command = "version";
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--mock") {
      mock = true;
      continue;
    }
    if (arg === "--live") {
      live = true;
      continue;
    }
    const valueOption = Object.hasOwn(VALUE_OPTIONS, arg) ? VALUE_OPTIONS[arg] : undefined;
    if (valueOption) {
      usedOptions.add(arg);
      const next = argv[++i];
      if (!next || next.startsWith("-")) {
        errors.push(`${arg} requires a value`);
      } else {
        values[valueOption] = next;
      }
      continue;
    }
    const equalsAt = arg.indexOf("=");
    if (equalsAt > 0) {
      const option = arg.slice(0, equalsAt);
      const equalsOption = Object.hasOwn(VALUE_OPTIONS, option) ? VALUE_OPTIONS[option] : undefined;
      if (equalsOption && option.startsWith("--")) {
        usedOptions.add(option);
        const value = arg.slice(equalsAt + 1);
        if (!value) {
          errors.push(`${option} requires a value`);
        } else {
          values[equalsOption] = value;
        }
        continue;
      }
    }
    errors.push(`unknown argument: ${arg}`);
  }

  if (command == null) {
    if (argv.length === 0) {
      command = "help";
    } else {
      errors.push('missing command (expected "send" or "suggest")');
      command = "help";
    }
  }

  const { configPath, out, resultsFolder, profile, ...overrides } = values;
  if (command === "send") {
    if (!configPath) errors.push("send requires --config <path>");
    const suggestOnly = [...usedOptions].filter((option) => ["--results", "--profile", "--write"].includes(option));
    if (suggestOnly.length) errors.push(`${suggestOnly.join(", ")} only supported by suggest`);
  }
  if (command === "suggest") {
    if (!resultsFolder) errors.push("suggest requires --results <dir>");
    if (dryRun || mock || live) errors.push("suggest does not accept --dry-run, --mock or --live");
    if (Object.keys(overrides).length) errors.push("send overrides are not supported by suggest");
  }
  if (profile !== undefined && profile !== "default" && profile !== "kit") {
    errors.push("--profile must be default or kit");
  }

  // Safe default: neither mode → dry-run (never live without --live).
  if (command === "send" && !dryRun && !mock && !live) {
    dryRun = true;
  }

  // Explicit safety: --dry-run / --mock win over --live.
  if (dryRun || mock) {
    live = false;
  }

  return {
    command,
    configPath,
    resultsFolder,
    profile: profile === "default" || profile === "kit" ? profile : undefined,
    dryRun,
    mock,
    live,
    out,
    ...overrides,
    errors,
  };
}
