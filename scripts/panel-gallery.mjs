#!/usr/bin/env node
/**
 * Widget picker — one PNG per filled panel on current allure-results.
 * No collages, no empty tiles, no stretched marketing layouts.
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { PANEL_CATALOG, parseConfig } from "../packages/config/dist/src/index.js";
import {
  isHistoryEmpty,
  loadReportAnalytics,
  stabilityBarsFromCases,
  renderCollagePng,
} from "../packages/core/dist/src/index.js";

import { REPO_ROOT } from "./allure-env.mjs";
import { enrichAllureLayers } from "./enrich-allure-layers.mjs";

const OUT = join(REPO_ROOT, "build", "widget-picker");
/** Square card — same proportions as builder palette thumb, not TG stretch. */
const CARD = 480;
const GRID = 10;

/** @type {Set<string>} */
const HISTORY_TYPES = new Set([
  "durationDynamics",
  "statusAgePyramid",
  "statusTransitions",
  "testBaseGrowthDynamics",
  "coverageDiff",
  "problemsDistribution",
  "successRateDistribution",
  "statusDynamics",
]);

const EXTRA = [{ id: "suites", type: "suites", title: "Suites" }];
const ALL = [...PANEL_CATALOG, ...EXTRA];

/**
 * @param {import("@qa-guru/allure-notifications-config").PanelMeta} panel
 * @param {import("@qa-guru/allure-notifications-core").ReportAnalytics} analytics
 */
function panelHasData(panel, analytics) {
  const type = panel.type;
  if (HISTORY_TYPES.has(type)) return !isHistoryEmpty(analytics.history);
  if (type === "testResultSeverities") {
    return Object.keys(analytics.severities ?? {}).length > 0;
  }
  if (type === "stabilityDistribution") {
    const historyCases = !isHistoryEmpty(analytics.history)
      ? analytics.history.stabilityCases
      : [];
    const cases =
      historyCases.length > 0 ? historyCases : analytics.stabilityCases;
    return stabilityBarsFromCases(cases, panel.groupBy).length > 0;
  }
  if (type === "durations") {
    if (panel.groupBy === "layer") {
      return (
        analytics.hasKnownLayerLabels &&
        Object.values(analytics.durationsMsByLayer).some((s) => s?.length)
      );
    }
    return analytics.durationsMs.length > 0;
  }
  if (type === "testingPyramid") {
    return analytics.hasKnownLayerLabels || analytics.suites.length > 0;
  }
  if (type === "currentStatus") return (analytics.statistic?.total ?? 0) > 0;
  if (type === "suites") return analytics.suites.length > 0;
  return false;
}

/** @param {import("@qa-guru/allure-notifications-config").PanelMeta} panel */
function skipReason(panel) {
  if (HISTORY_TYPES.has(panel.type)) return "нужен history.jsonl";
  if (panel.type === "testResultSeverities") return "нет severity-лейблов";
  if (panel.type === "stabilityDistribution") {
    return `нет label «${panel.groupBy?.replace("label-name:", "") ?? "?"}»`;
  }
  return "нет данных";
}

/**
 * @param {import("@qa-guru/allure-notifications-core").ReportAnalytics} analytics
 * @param {import("@qa-guru/allure-notifications-config").PanelMeta} panel
 * @param {string} reportDir
 * @param {string} resultsDir
 */
async function renderPanelPng(analytics, panel, reportDir, resultsDir) {
  const item = {
    type: panel.type,
    x: 0,
    y: 0,
    w: GRID,
    h: GRID,
    ...(panel.groupBy ? { groupBy: panel.groupBy } : {}),
    ...(panel.by ? { by: panel.by } : {}),
  };
  const config = parseConfig({
    base: {
      project: "allure-notifications",
      allureFolder: reportDir,
      allureResultsFolder: resultsDir,
      enableChart: true,
      darkMode: true,
      chart: {
        mode: "collage",
        layout: "free",
        width: CARD,
        height: CARD,
        headerHeight: 48,
        cardGap: 10,
        gridCols: GRID,
        gridRows: GRID,
        pyramidFallback: "none",
        items: [item],
      },
    },
  });
  return renderCollagePng(config, analytics);
}

/**
 * @param {Array<{ id: string, title: string, file: string, type: string }>} items
 * @param {Array<{ id: string, title: string, reason: string }>} skipped
 * @param {{ total: number, when: string }} meta
 */
function html(items, skipped, meta) {
  const tiles = items
    .map(
      (w) => `<article class="tile">
  <a href="${w.file}" target="_blank" title="Открыть PNG">
    <img src="${w.file}" alt="${w.title}" width="${CARD}" height="${CARD}" />
  </a>
  <h2>${w.title}</h2>
  <p class="type"><code>${w.type}</code> · <code>${w.id}</code></p>
</article>`,
    )
    .join("\n");

  const skip = skipped
    .map((s) => `<li><code>${s.id}</code> — ${s.title}: ${s.reason}</li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Widget picker — ${meta.total} tests</title>
  <style>
    :root { color-scheme: dark; --bg:#0d0f14; --card:#161a22; --border:#2c3344; --text:#e8ecf4; --muted:#8b95a8; }
    * { box-sizing: border-box; }
    body { margin:0; padding:24px 28px 48px; font:15px/1.45 system-ui,sans-serif; background:var(--bg); color:var(--text); }
    h1 { margin:0 0 6px; font-size:20px; font-weight:600; }
    .lead { margin:0 0 28px; color:var(--muted); max-width:60ch; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(${CARD + 32}px,1fr)); gap:20px; }
    .tile { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; }
    .tile a { display:block; line-height:0; border-radius:8px; overflow:hidden; }
    .tile img { display:block; width:${CARD}px; height:${CARD}px; max-width:100%; margin:0 auto; }
    .tile h2 { margin:12px 0 4px; font-size:14px; font-weight:600; }
    .type { margin:0; font-size:12px; color:var(--muted); }
    code { font-size:11px; color:#85b7ff; }
    details { margin-top:36px; color:var(--muted); font-size:13px; }
    details ul { margin:8px 0 0; padding-left:18px; }
  </style>
</head>
<body>
  <h1>Виджеты с данными · ${meta.total} tests · ${meta.when}</h1>
  <p class="lead">${items.length} картинок с текущего прогона. Клик — PNG в полном размере (${CARD}×${CARD}). Выбирай что ставить в коллаж.</p>
  <div class="grid">${tiles}</div>
  <details>
    <summary>Скрыто — пусто на этом прогоне (${skipped.length})</summary>
    <ul>${skip}</ul>
  </details>
</body>
</html>`;
}

async function main() {
  const reportDir = join(REPO_ROOT, "allure-report");
  const resultsDir = join(REPO_ROOT, "allure-results");
  await enrichAllureLayers(resultsDir);

  const config = parseConfig({
    base: { allureFolder: reportDir, allureResultsFolder: resultsDir },
  });
  const analytics = await loadReportAnalytics(config);

  await mkdir(OUT, { recursive: true });
  for (const name of await readdir(OUT)) {
    if (name.endsWith(".png") || name === "index.html") {
      await rm(join(OUT, name), { force: true });
    }
  }

  /** @type {Array<{ id: string, title: string, file: string, type: string }>} */
  const items = [];
  /** @type {Array<{ id: string, title: string, reason: string }>} */
  const skipped = [];

  for (const panel of ALL) {
    if (!panelHasData(panel, analytics)) {
      skipped.push({ id: panel.id, title: panel.title, reason: skipReason(panel) });
      continue;
    }
    const png = await renderPanelPng(analytics, panel, reportDir, resultsDir);
    const file = `${panel.id}.png`;
    await writeFile(join(OUT, file), png);
    items.push({
      id: panel.id,
      title: panel.title,
      file,
      type:
        panel.type +
        (panel.groupBy ? ` groupBy=${panel.groupBy}` : panel.by ? ` by=${panel.by}` : ""),
    });
  }

  const total = analytics.statistic?.total ?? analytics.resultCount ?? 0;
  await writeFile(
    join(OUT, "index.html"),
    html(items, skipped, {
      total,
      when: new Date().toISOString().slice(0, 16).replace("T", " "),
    }),
  );

  console.log(`Widget picker → ${OUT}`);
  for (const w of items) console.log(`  ${w.file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
