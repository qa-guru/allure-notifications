import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DEFAULT_CARD_GAP,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_TILE_PAD,
  GRID_COLS,
  GRID_ROWS,
  parseConfig,
  suggestLayout,
  type ChartProfile,
  type Config,
  type SuggestedLayout,
} from "@qa-guru/allure-notifications-config";
import { loadSuggestSignals } from "@qa-guru/allure-notifications-core";

import { loadConfigFile } from "./send.js";
import { llmOptionsFromEnv, suggestLayoutViaLlm } from "./suggest-llm.js";

export type SuggestOptions = {
  resultsFolder: string;
  profile?: ChartProfile;
  configPath?: string;
  out?: string;
  cwd?: string;
  /** Test seam: defaults to process.env. */
  env?: Partial<Record<"ANB_AI_BASE_URL" | "ANB_AI_MODEL" | "ANB_AI_API_KEY", string | undefined>>;
  fetchImpl?: typeof fetch;
};

export type SuggestResult = {
  config: Config;
  json: string;
  outPath?: string;
  warnings: string[];
};

export async function suggest(options: SuggestOptions): Promise<SuggestResult> {
  const cwd = options.cwd ?? process.cwd();
  const resultsFolder = resolve(cwd, options.resultsFolder);
  const existing = options.configPath
    ? await loadConfigFile(resolve(cwd, options.configPath))
    : parseConfig({ base: {} });
  const signals = await loadSuggestSignals(resultsFolder, existing);
  const profileOverride = options.profile
    ?? (existing.base.chart?.profile === "kit" ? "kit" : undefined);
  const warnings: string[] = [];
  const llm = llmOptionsFromEnv(options.env ?? process.env);
  let layout: SuggestedLayout | undefined;
  if (llm) {
    try {
      layout = await suggestLayoutViaLlm(signals, {
        ...llm,
        profile: profileOverride,
        fetchImpl: options.fetchImpl,
      });
    } catch (err) {
      warnings.push(`llm suggest failed (${err instanceof Error ? err.message : String(err)}); using deterministic scorer`);
    }
  }
  const { profile, canvas, items } = layout
    ?? suggestLayout({ ...signals, profile: profileOverride });
  const selected = new Set(items.map((item) => item.id));
  const config = parseConfig({
    base: {
      allureFolder: signals.allureFolder,
      allureResultsFolder: resultsFolder,
      enableChart: true,
      darkMode: true,
      chart: {
        profile,
        mode: "collage",
        layout: "free",
        width: canvas.w,
        height: canvas.h,
        gridCols: GRID_COLS,
        gridRows: GRID_ROWS,
        headerHeight: DEFAULT_HEADER_HEIGHT,
        cardGap: DEFAULT_CARD_GAP,
        tilePad: DEFAULT_TILE_PAD,
        pyramidFallback: "suites",
        historyPath: signals.historyPath,
        historyLimit: existing.base.chart?.historyLimit,
        allureQualityGatePath: selected.has("allureQualityGate") ? signals.allureQualityGatePath : undefined,
        sonarQualityGatePath: selected.has("sonarQualityGate") ? signals.sonarQualityGatePath : undefined,
        testsTablePath: selected.has("testsTable") ? signals.testsTablePath : undefined,
        items,
      },
    },
  });
  if (selected.has("allureQualityGate") && !signals.allureQualityGatePath) {
    warnings.push("allureQualityGate selected from qualityGate.rules; provide chart.allureQualityGatePath or generate widgets/kit-panels/allureQualityGate.json before send");
  }
  const json = JSON.stringify(config, null, 2) + "\n";
  const outPath = options.out ? resolve(cwd, options.out) : undefined;
  if (outPath) await writeFile(outPath, json, { flag: "wx" });
  return { config, json, outPath, warnings };
}
