/**
 * Quality-gate collage data loaders (T6).
 *
 * AQG: explicit `chart.allureQualityGatePath` or report widget
 * `widgets/kit-panels/allureQualityGate.json`.
 * SQG: explicit `chart.sonarProjectStatusPath` → kit
 * `sonarProjectStatusToQualityGateOptions` (no second mapper).
 */

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  isKitOnlyChartItem,
  normalizeChartProfile,
  resolvePanelMeta,
  shouldSilentSkipKitOnlyItem,
  type ChartItem,
  type Config,
  type KitOnlyPanelId,
} from "@qa-guru/allure-notifications-config";
import {
  parseKitQualityGateData,
  type KitQualityGateData,
} from "@qa-guru/allure-report-kit";
import { sonarProjectStatusToQualityGateOptions } from "@qa-guru/allure-report-kit/runtime";

export type QualityGateCollageData = Partial<
  Record<KitOnlyPanelId, KitQualityGateData>
>;

export class QualityGateDataMissingError extends Error {
  constructor(
    public readonly panelId: KitOnlyPanelId,
    public readonly path?: string,
  ) {
    const where = path ? ` (tried ${path})` : "";
    super(
      `quality gate data missing for ${panelId}${where}; ` +
        `set chart.allureQualityGatePath / chart.sonarProjectStatusPath ` +
        `or ensure report widgets/kit-panels/<id>.json exists`,
    );
    this.name = "QualityGateDataMissingError";
  }
}

/** Resolve stable catalog id for AQG vs SQG tiles. */
export function resolveQualityGatePanelId(
  item: Partial<ChartItem> & { id?: string },
): KitOnlyPanelId | null {
  if (item.id === "allureQualityGate" || item.id === "sonarQualityGate") {
    return item.id;
  }
  if (item.type?.trim() === "qualityGate") {
    return null;
  }
  const meta = resolvePanelMeta(item);
  if (meta?.id === "allureQualityGate" || meta?.id === "sonarQualityGate") {
    return meta.id;
  }
  return null;
}

function kitQualityGateItems(config: Config): ChartItem[] {
  const chart = config.base.chart;
  const profile = normalizeChartProfile(chart?.profile);
  const items = chart?.items ?? [];
  return items.filter(
    (item) =>
      isKitOnlyChartItem(item) && !shouldSilentSkipKitOnlyItem(profile, item),
  );
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`invalid JSON in ${path}: ${msg}`);
  }
}

async function readFirstKitQualityGateJson(
  paths: string[],
  panelId: KitOnlyPanelId,
): Promise<KitQualityGateData> {
  for (const path of paths) {
    if (!(await fileExists(path))) {
      continue;
    }
    const data = await readJsonFile(path);
    return parseKitQualityGateData(data);
  }
  throw new QualityGateDataMissingError(panelId, paths.join(" | "));
}

async function loadAllureQualityGateData(
  config: Config,
): Promise<KitQualityGateData> {
  const chart = config.base.chart;
  const allureFolder = config.base.allureFolder ?? "allure-report/";
  const explicit = chart?.allureQualityGatePath?.trim();
  const candidates = explicit
    ? [explicit]
    : [join(allureFolder, "widgets/kit-panels/allureQualityGate.json")];
  return readFirstKitQualityGateJson(candidates, "allureQualityGate");
}

async function loadSonarQualityGateData(
  config: Config,
): Promise<KitQualityGateData> {
  const path = config.base.chart?.sonarProjectStatusPath?.trim();
  if (!path) {
    throw new QualityGateDataMissingError("sonarQualityGate");
  }
  const raw = await readJsonFile(path);
  const mapped = sonarProjectStatusToQualityGateOptions(
    raw as Parameters<typeof sonarProjectStatusToQualityGateOptions>[0],
  );
  return parseKitQualityGateData(mapped);
}

/**
 * Load kit QG payloads for tiles that collage will render (`profile === "kit"`).
 * Returns `{}` when no kit QG items are active (default profile silent-skip).
 */
export async function loadQualityGateCollageData(
  config: Config,
): Promise<QualityGateCollageData> {
  const items = kitQualityGateItems(config);
  if (items.length === 0) {
    return {};
  }

  const result: QualityGateCollageData = {};
  const needed = new Set<KitOnlyPanelId>();

  for (const item of items) {
    const id = resolveQualityGatePanelId(item);
    if (!id) {
      throw new Error(
        'chart.items qualityGate tile requires id "allureQualityGate" or "sonarQualityGate"',
      );
    }
    needed.add(id);
  }

  if (needed.has("allureQualityGate") && !result.allureQualityGate) {
    result.allureQualityGate = await loadAllureQualityGateData(config);
  }
  if (needed.has("sonarQualityGate") && !result.sonarQualityGate) {
    result.sonarQualityGate = await loadSonarQualityGateData(config);
  }

  return result;
}
