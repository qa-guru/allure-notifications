import { PANEL_META, resolvePanelMeta, type ChartItem } from "./catalog.js";
import { CHART_PROFILE_DEFAULT, isKitOnlyPanelId, type ChartProfile } from "./kit-only.js";
import { CANVAS_PRESETS, DEFAULT_CANVAS, DEFAULT_ITEMS, type CanvasSize } from "./presets.js";

export type SuggestSignals = {
  statistic: {
    passed: number;
    failed: number;
    broken: number;
    skipped: number;
    unknown: number;
    total: number;
  };
  durationMs: number;
  layers: Record<string, number>;
  hasLayerLabels: boolean;
  hasKnownLayerLabels: boolean;
  knownLayerCount: number;
  severities: Record<string, number>;
  suites: ReadonlyArray<{ name: string; count: number }>;
  durationsMsByLayer: Record<string, { count: number; meanMs: number }>;
  historyRunCount: number;
  qualityGateRuleCount: number;
  profile?: ChartProfile;
  allureFolder?: string;
  historyPath?: string;
  allureQualityGatePath?: string;
  sonarQualityGatePath?: string;
  testsTablePath?: string;
};

export type SuggestedLayout = {
  profile: ChartProfile;
  canvas: CanvasSize;
  items: ChartItem[];
};

const HERO_ITEMS: readonly ChartItem[] = [
  { type: "currentStatus", x: 0, y: 0, w: 5, h: 4 },
  { type: "statusDynamics", x: 5, y: 0, w: 5, h: 4 },
  { type: "testingPyramid", x: 0, y: 4, w: 4, h: 3 },
  { type: "durations", x: 4, y: 4, w: 6, h: 3, groupBy: "layer" },
  { type: "successRateDistribution", x: 0, y: 7, w: 3, h: 3 },
  { type: "durationDynamics", x: 3, y: 7, w: 4, h: 3 },
  { type: "statusTransitions", x: 7, y: 7, w: 3, h: 3 },
];

function template(canvas: string, items: readonly ChartItem[]) {
  return Object.freeze({
    canvas: Object.freeze({ ...CANVAS_PRESETS[canvas]! }),
    items: Object.freeze(items.map((item) => Object.freeze({ ...item }))),
  });
}

export const SUGGEST_TEMPLATES = Object.freeze({
  default: template(DEFAULT_CANVAS, DEFAULT_ITEMS),
  trends: template("1080x1080", HERO_ITEMS.slice(0, 6)),
  hero: template(DEFAULT_CANVAS, HERO_ITEMS),
  detail: template("1410x1080", HERO_ITEMS),
});

function placePanels(slots: readonly ChartItem[], ids: readonly string[]): ChartItem[] {
  const remaining = new Set(ids);
  const anchors = slots.map((slot) => {
    const id = resolvePanelMeta(slot)!.id;
    return remaining.delete(id) ? id : undefined;
  });
  return slots.flatMap((slot, index) => {
    const id = anchors[index] ?? remaining.values().next().value;
    if (!id) return [];
    remaining.delete(id);
    const meta = PANEL_META[id]!;
    return [{
      type: meta.type,
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      ...(isKitOnlyPanelId(id) ? { id } : {}),
      ...(meta.groupBy ? { groupBy: meta.groupBy } : {}),
      ...(meta.by ? { by: meta.by } : {}),
    }];
  });
}

/**
 * Materialize caller-chosen catalog ids into a canonical template. Ids never
 * invent coordinates: they occupy the fixed slots of `default` / `trends` /
 * `detail` by count, like the deterministic scorer does.
 */
export function materializeLayout(
  ids: readonly string[],
  profile: ChartProfile,
): SuggestedLayout {
  const unique = [...new Set(ids)].slice(0, SUGGEST_TEMPLATES.detail.items.length);
  const selected = unique.length <= SUGGEST_TEMPLATES.default.items.length
    ? SUGGEST_TEMPLATES.default
    : unique.length <= SUGGEST_TEMPLATES.trends.items.length
      ? SUGGEST_TEMPLATES.trends
      : SUGGEST_TEMPLATES.detail;
  return { profile, canvas: { ...selected.canvas }, items: placePanels(selected.items, unique) };
}

export function suggestLayout(signals: SuggestSignals): SuggestedLayout {
  const gates: string[] = [];
  if (signals.qualityGateRuleCount > 0 || signals.allureQualityGatePath) {
    gates.push("allureQualityGate");
  }
  if (signals.sonarQualityGatePath) gates.push("sonarQualityGate");
  const failures = signals.statistic.failed + signals.statistic.broken > 0;
  const profile = signals.profile ?? (
    gates.length > 0 || (failures && signals.testsTablePath) ? "kit" : CHART_PROFILE_DEFAULT
  );
  const kitGates = profile === "kit" ? gates : [];
  const failurePanel = failures
    ? profile === "kit" && signals.testsTablePath ? "testsTable" : "problemsDistribution"
    : undefined;
  const history = signals.historyRunCount >= 2;
  const layers = signals.hasLayerLabels && signals.hasKnownLayerLabels && signals.knownLayerCount >= 2;

  if (!history && kitGates.length === 0 && !failurePanel) {
    return {
      profile,
      canvas: { ...SUGGEST_TEMPLATES.default.canvas },
      items: DEFAULT_ITEMS.map((item) => ({ ...item })),
    };
  }

  const ids = [
    "currentStatus",
    ...(history ? ["durationDynamics", "statusDynamics"] : []),
    ...(layers ? ["testingPyramid", "durationsByLayer"] : []),
    ...kitGates.slice(0, 1),
    ...(failurePanel ? [failurePanel] : []),
    ...kitGates.slice(1),
    ...(history ? ["statusTransitions", "successRateDistribution", "testBaseGrowthDynamics"] : []),
  ].slice(0, 7);
  const selected = ids.length <= 4
    ? SUGGEST_TEMPLATES.default
    : ids.length <= 6
      ? SUGGEST_TEMPLATES.trends
      : layers && kitGates.length === 0 && failurePanel !== "testsTable"
        ? SUGGEST_TEMPLATES.hero
        : SUGGEST_TEMPLATES.detail;

  return { profile, canvas: { ...selected.canvas }, items: placePanels(selected.items, ids) };
}
