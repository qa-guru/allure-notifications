import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_EPIC } from "./defaults.js";
import type { SuiteMeta } from "./types.js";

const REGISTRY_DIRNAME = ".suite-meta-registry.d";

export interface RegistryEntry {
  epic: string;
  feature: string;
  story: string;
  layer: string;
  severity: string;
  component?: string;
}

function registryDir(): string {
  const dir = process.env.ALLURE_RESULTS_DIR;
  if (!dir) {
    throw new Error(
      "registerSuiteMeta: ALLURE_RESULTS_DIR is not set (required for declareSuite)",
    );
  }
  return path.join(dir, REGISTRY_DIRNAME);
}

function normalizeMeta(meta: SuiteMeta): RegistryEntry {
  const entry: RegistryEntry = {
    epic: meta.epic ?? DEFAULT_EPIC,
    feature: meta.feature,
    story: meta.story,
    layer: meta.layer,
    severity: meta.severity,
  };
  if (meta.component) {
    entry.component = meta.component;
  }
  return entry;
}

/** Normalize a test file path to posix keys for registry lookup. */
export function normalizeTestFileKeys(sourceFile: string): string[] {
  const abs = path.resolve(sourceFile);
  const keys = new Set<string>();
  keys.add(abs);
  keys.add(abs.replace(/\\/g, "/"));

  const posix = abs.replace(/\\/g, "/");
  for (const marker of ["/packages/", "/apps/"]) {
    const idx = posix.indexOf(marker);
    if (idx < 0) continue;
    const rel = posix.slice(idx + 1);
    keys.add(rel);
    if (rel.includes("/dist/test/")) {
      keys.add(rel.replace("/dist/test/", "/test/").replace(/\.js$/, ".ts"));
      if (rel.startsWith("apps/builder/")) {
        keys.add(rel.replace("/dist/test/", "/tests/").replace(/\.js$/, ".ts"));
      }
    } else if (rel.includes("/test/") && rel.endsWith(".ts")) {
      keys.add(
        rel.replace("/test/", "/dist/test/").replace(/\.ts$/, ".js"),
      );
    } else if (rel.includes("/tests/") && rel.endsWith(".ts")) {
      keys.add(
        rel.replace("/tests/", "/dist/test/").replace(/\.ts$/, ".js"),
      );
    }
    break;
  }

  return [...keys];
}

/** Parse declareSuite caller from a stack trace string (testable). */
export function parseCallerFromStack(stack: string): string {
  const skipPatterns = [
    "register-suite",
    "node-test",
    "resolveDeclareSuiteCaller",
    "parseCallerFromStack",
    "declareSuite",
  ];

  for (const line of stack.split("\n")) {
    if (skipPatterns.some((part) => line.includes(part))) continue;

    const match =
      line.match(/\(([^)]+:\d+:\d+)\)/) ??
      line.match(/at (file:\/\/[^\s]+)/) ??
      line.match(/at ([^\s()]+:\d+:\d+)/);
    if (!match?.[1]) continue;

    let filePart = match[1].replace(/^file:\/\//, "").replace(/:\d+:\d+$/, "");
    if (filePart.includes(".test.") || filePart.includes(".spec.")) {
      return filePart;
    }
  }

  throw new Error("declareSuite: unable to resolve caller test file from stack");
}

/** Resolve the test file that invoked declareSuite() at module load. */
export function resolveDeclareSuiteCaller(stack: string | undefined): string {
  return parseCallerFromStack(stack ?? "");
}

/** Register suite metadata for post-run merge into Allure result JSON. */
export function registerSuiteMeta(sourceFile: string, meta: SuiteMeta): void {
  const entry = normalizeMeta(meta);
  const dir = registryDir();
  fs.mkdirSync(dir, { recursive: true });

  const keys = normalizeTestFileKeys(sourceFile);
  const shardId = crypto.createHash("sha1").update(sourceFile).digest("hex");
  const shardPath = path.join(dir, `${shardId}.json`);
  fs.writeFileSync(
    shardPath,
    `${JSON.stringify({ keys, entry }, null, 2)}\n`,
    "utf8",
  );
}
