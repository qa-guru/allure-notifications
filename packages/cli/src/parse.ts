/**
 * Minimal argv parser for `allure-notifications send --config …`.
 * No external CLI framework — keeps Stage D deps thin.
 */

export type CliCommand = "send" | "help" | "version";

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
  dryRun: boolean;
  mock: boolean;
  live: boolean;
  out?: string;
  errors: string[];
};

const HELP_TEXT = `allure-notifications — Allure report → messenger notifications (6.0)

Usage:
  allure-notifications send --config <path> [overrides] [--dry-run|--mock|--live] [--out <png>]

Options:
  --config <path>                  Path to config.json (required for send)
  --allure-folder <path>           Override base.allureFolder (cwd-relative)
  --allure-results-folder <path>   Override base.allureResultsFolder (cwd-relative)
  --project <name>                 Override base.project
  --report-url <url>               Override base.links.report
  --dashboard-url <url>            Override base.links.dashboard
  --testops-url <url>              Override base.links.testops
  --build-url <url>                Override base.links.build
  --dry-run                        Render collage; skip network I/O (default)
  --mock                           Render collage; mock deliveries (no network)
  --live                           Live Telegram send; needs env credentials
  --out <path>                     Write PNG buffer to file (cwd-relative)
  -h, --help                       Show help
  -V, --version                    Show version

Live credentials (env overrides config): TELEGRAM_BOT_TOKEN | TELEGRAM_TOKEN,
TELEGRAM_CHAT_ID, TELEGRAM_TOPIC_ID. See docs/telegram-dogfood.md.
`;

type ValueOption =
  | "configPath"
  | "out"
  | keyof ConfigOverrides;

const VALUE_OPTIONS: Record<string, ValueOption> = {
  "--config": "configPath",
  "-c": "configPath",
  "--out": "out",
  "-o": "out",
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
  let configPath: string | undefined;
  let dryRun = false;
  let mock = false;
  let live = false;
  let out: string | undefined;
  const overrides: ConfigOverrides = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "send" || arg === "help" || arg === "version") {
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
    const valueOption = VALUE_OPTIONS[arg];
    if (valueOption) {
      const next = argv[++i];
      if (!next || next.startsWith("-")) {
        errors.push(`${arg} requires a value`);
      } else if (valueOption === "configPath") {
        configPath = next;
      } else if (valueOption === "out") {
        out = next;
      } else {
        overrides[valueOption] = next;
      }
      continue;
    }
    const equalsAt = arg.indexOf("=");
    if (equalsAt > 0) {
      const option = arg.slice(0, equalsAt);
      const equalsOption = VALUE_OPTIONS[option];
      if (equalsOption && option.startsWith("--")) {
        const value = arg.slice(equalsAt + 1);
        if (!value) {
          errors.push(`${option} requires a value`);
        } else if (equalsOption === "configPath") {
          configPath = value;
        } else if (equalsOption === "out") {
          out = value;
        } else {
          overrides[equalsOption] = value;
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
      errors.push('missing command (expected "send")');
      command = "help";
    }
  }

  if (command === "send" && !configPath) {
    errors.push("send requires --config <path>");
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
    dryRun,
    mock,
    live,
    out,
    ...overrides,
    errors,
  };
}
