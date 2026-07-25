/**
 * Programmatic CLI entry — used by bin and tests.
 */

import { helpText, parseArgs } from "./parse.js";
import { send } from "./send.js";

export const PACKAGE = "@allure-notifications/cli";
export const PHASE = 3;
export const VERSION = "6.0.0";

export type RunCliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function modeLabel(result: {
  dryRun: boolean;
  mock: boolean;
  live: boolean;
}): string {
  if (result.live) {
    return "live";
  }
  if (result.mock) {
    return "mock";
  }
  return "dry-run";
}

/**
 * Run CLI against argv (without node/script). Does not call process.exit.
 */
export async function runCli(argv: string[]): Promise<RunCliResult> {
  const args = parseArgs(argv);

  if (args.command === "help") {
    return {
      exitCode: args.errors.length > 0 ? 1 : 0,
      stdout: helpText(),
      stderr: args.errors.length ? args.errors.join("\n") + "\n" : "",
    };
  }

  if (args.command === "version") {
    return { exitCode: 0, stdout: `${VERSION}\n`, stderr: "" };
  }

  if (args.errors.length > 0) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: args.errors.join("\n") + "\n" + helpText(),
    };
  }

  try {
    const result = await send({
      configPath: args.configPath!,
      dryRun: args.dryRun,
      mock: args.mock,
      live: args.live,
      out: args.out,
    });

    const lines: string[] = [
      `allure-notifications ${VERSION}`,
      `config: ${result.configPath}`,
      `collage: ${result.png.byteLength} bytes` +
        (result.pngPath ? ` → ${result.pngPath}` : ""),
      `mode: ${modeLabel(result)}`,
    ];
    for (const d of result.deliveries) {
      lines.push(`  [${d.status}] ${d.messenger}: ${d.detail}`);
    }
    lines.push("ok");

    return { exitCode: 0, stdout: lines.join("\n") + "\n", stderr: "" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { exitCode: 1, stdout: "", stderr: `error: ${msg}\n` };
  }
}
