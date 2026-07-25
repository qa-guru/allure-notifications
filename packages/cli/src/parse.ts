/**
 * Minimal argv parser for `allure-notifications send --config …`.
 * No external CLI framework — keeps Stage D deps thin.
 */

export type CliCommand = "send" | "help" | "version";

export type ParsedArgs = {
  command: CliCommand;
  configPath?: string;
  dryRun: boolean;
  mock: boolean;
  out?: string;
  errors: string[];
};

const HELP_TEXT = `allure-notifications — Allure report → messenger notifications (6.0)

Usage:
  allure-notifications send --config <path> [--dry-run|--mock] [--out <png>]

Options:
  --config <path>   Path to config.json (required for send)
  --dry-run         Render collage; skip messenger network I/O
  --mock            Render collage; mock messenger deliveries (no network)
  --out <path>      Write PNG buffer to file
  -h, --help        Show help
  -V, --version     Show version
`;

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
  let out: string | undefined;

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
    if (arg === "--config" || arg === "-c") {
      const next = argv[++i];
      if (!next || next.startsWith("-")) {
        errors.push("--config requires a path");
      } else {
        configPath = next;
      }
      continue;
    }
    if (arg.startsWith("--config=")) {
      configPath = arg.slice("--config=".length);
      if (!configPath) {
        errors.push("--config requires a path");
      }
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      const next = argv[++i];
      if (!next || next.startsWith("-")) {
        errors.push("--out requires a path");
      } else {
        out = next;
      }
      continue;
    }
    if (arg.startsWith("--out=")) {
      out = arg.slice("--out=".length);
      if (!out) {
        errors.push("--out requires a path");
      }
      continue;
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

  if (command === "send" && !dryRun && !mock) {
    // Stage D: never hit live messengers without an explicit mode.
    dryRun = true;
  }

  return { command, configPath, dryRun, mock, out, errors };
}
