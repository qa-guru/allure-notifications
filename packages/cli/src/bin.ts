#!/usr/bin/env node
/**
 * Bin entry: `allure-notifications`
 */

import { runCli } from "./cli.js";

const result = await runCli(process.argv.slice(2));
if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}
process.exit(result.exitCode);
