#!/usr/bin/env node
/**
 * Gate: every *-result.json must carry explicit Allure suite labels from tests.
 * Required: epic, feature, story, layer, severity.
 * Also required when layer is e2e|component: label component.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./allure-env.mjs";

const RESULT_SUFFIX = "-result.json";
const REQUIRED = ["epic", "feature", "story", "layer", "severity"];
const COMPONENT_LAYERS = new Set(["e2e", "component"]);

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

/** @param {unknown} raw */
function labelMap(raw) {
  /** @type {Record<string, string>} */
  const map = {};
  if (!raw || typeof raw !== "object") return map;
  const labels = /** @type {{ labels?: unknown }} */ (raw).labels;
  if (!Array.isArray(labels)) return map;
  for (const row of labels) {
    if (!row || typeof row !== "object") continue;
    const { name, value } = /** @type {{ name?: string; value?: string }} */ (
      row
    );
    if (name && value) map[name] = value;
  }
  return map;
}

/** @param {string} resultsDir */
export async function checkAllureLabels(resultsDir) {
  const files = await walkResults(resultsDir);
  /** @type {string[]} */
  const failures = [];

  for (const file of files) {
    const raw = JSON.parse(await readFile(file, "utf8"));
    const labels = labelMap(raw);
    const name =
      typeof raw === "object" && raw && "name" in raw
        ? String(/** @type {{ name?: string }} */ (raw).name ?? file)
        : file;

    for (const key of REQUIRED) {
      if (!labels[key]?.trim()) {
        failures.push(`${name}: missing label "${key}" (${file})`);
      }
    }

    const layer = labels.layer?.trim().toLowerCase();
    if (layer && COMPONENT_LAYERS.has(layer) && !labels.component?.trim()) {
      failures.push(
        `${name}: missing label "component" for layer=${layer} (${file})`,
      );
    }
  }

  return { total: files.length, failures };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir =
    process.argv[2] ||
    process.env.ALLURE_RESULTS_DIR ||
    join(REPO_ROOT, "allure-results");

  const { total, failures } = await checkAllureLabels(dir);
  if (failures.length) {
    console.error(`check-allure-labels: ${failures.length} issue(s) in ${total} results`);
    for (const line of failures) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log(`check-allure-labels: ${total}/${total} OK (${dir})`);
}
