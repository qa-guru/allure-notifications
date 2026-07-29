#!/usr/bin/env node
/**
 * @deprecated SSOT path uses explicit labels via @allure-notifications/test-meta
 * (declareSuite / bindSuiteMeta). Dev-only fallback — not invoked from run-tests.mjs
 * or ci-telegram.sh.
 *
 * Tag Allure results with `layer` labels (post-hoc heuristics).
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./allure-env.mjs";

const RESULT_SUFFIX = "-result.json";

/** @param {string} haystack */
function inferLayer(haystack) {
  const p = haystack.replace(/\\/g, "/").toLowerCase();
  if (
    (p.includes("@allure-notifications/builder") && p.includes(".spec.")) ||
    (p.includes("apps/builder/tests/") && p.includes(".spec.")) ||
    p.includes("e2e-blanket") ||
    p.includes("e2e-coverage") ||
    p.includes("smoke.spec")
  ) {
    return "e2e";
  }
  if (
    p.includes("@allure-notifications/builder.tests") ||
    p.includes("config-parity") ||
    p.includes("pyramid-parity") ||
    (p.includes("apps/builder/") && p.includes(".test."))
  ) {
    return "component";
  }
  return "unit";
}

/** @param {unknown} raw */
function labelPaths(raw) {
  if (!raw || typeof raw !== "object") {
    return "";
  }
  const obj = /** @type {Record<string, unknown>} */ (raw);
  const labels = Array.isArray(obj.labels) ? obj.labels : [];
  const bits = [];
  for (const row of labels) {
    if (!row || typeof row !== "object") continue;
    const name = /** @type {{ name?: string, value?: string }} */ (row).name;
    const value = /** @type {{ name?: string, value?: string }} */ (row).value;
    if (name && value) bits.push(`${name}=${value}`);
  }
  if (typeof obj.fullName === "string") bits.push(obj.fullName);
  if (typeof obj.name === "string") bits.push(obj.name);
  return bits.join(" ");
}

/** @param {string} dir */
async function walkResults(dir) {
  /** @type {string[]} */
  const out = [];
  async function walk(current, depth) {
    if (depth > 8) return;
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = join(current, ent.name);
      if (ent.isDirectory()) {
        await walk(full, depth + 1);
      } else if (ent.isFile() && ent.name.endsWith(RESULT_SUFFIX)) {
        out.push(full);
      }
    }
  }
  await walk(dir, 0);
  return out;
}

/** @param {string} resultsDir */
export async function enrichAllureLayers(resultsDir) {
  const files = await walkResults(resultsDir);
  let touched = 0;
  for (const file of files) {
    const raw = JSON.parse(await readFile(file, "utf8"));
    const labels = Array.isArray(raw.labels) ? [...raw.labels] : [];
    const layer = inferLayer(labelPaths(raw));
    const withoutLayer = labels.filter(
      (l) => !(l && typeof l === "object" && l.name === "layer"),
    );
    withoutLayer.push({ name: "layer", value: layer });
    raw.labels = withoutLayer;
    await writeFile(file, `${JSON.stringify(raw)}\n`, "utf8");
    touched += 1;
  }
  return { files: files.length, touched };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir =
    process.argv[2] ||
    process.env.ALLURE_RESULTS_DIR ||
    join(REPO_ROOT, "allure-results");
  const { files, touched } = await enrichAllureLayers(dir);
  console.log(`enrich-allure-layers: ${touched}/${files} results tagged (${dir})`);
}
