/**
 * Panel catalog extracted from allure-notifications-builder `js/app.js`.
 * 17 slots ↔ awesome-charts / ChartType (+ groupBy / by variants).
 */

export type PanelMeta = {
  id: string;
  type: string;
  title: string;
  hint: string;
  defaultW: number;
  defaultH: number;
  groupBy?: string;
  by?: string;
};

export type ChartItem = {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Catalog id — required to distinguish AQG vs SQG when `type` is `qualityGate`. */
  id?: string;
  groupBy?: string;
  by?: string;
};

/**
 * Palette add footprint is always 2×2 (`defaultW` / `defaultH`).
 * `hint` = panel title (palette caption under thumb).
 * Grid layout footprints live only in `DEFAULT_ITEMS` / vector `items` — never here.
 */
const PALETTE_W = 2;
const PALETTE_H = 2;

type PanelSeed = Omit<PanelMeta, "hint" | "defaultW" | "defaultH">;

function panel(seed: PanelSeed): PanelMeta {
  return {
    ...seed,
    hint: seed.title,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  };
}

/** @type {ReadonlyArray<PanelMeta>} */
export const PANEL_CATALOG: ReadonlyArray<PanelMeta> = Object.freeze([
  panel({ id: "currentStatus", type: "currentStatus", title: "Current status" }),
  panel({ id: "testingPyramid", type: "testingPyramid", title: "Testing pyramid" }),
  panel({
    id: "durationsByLayer",
    type: "durations",
    groupBy: "layer",
    title: "Durations by layer",
  }),
  panel({ id: "durationDynamics", type: "durationDynamics", title: "Duration dynamics" }),
  panel({ id: "statusAgePyramid", type: "statusAgePyramid", title: "Status age pyramid" }),
  panel({ id: "durations", type: "durations", title: "Durations" }),
  panel({ id: "coverageDiff", type: "coverageDiff", title: "Coverage diff" }),
  panel({
    id: "problemsDistribution",
    type: "problemsDistribution",
    by: "environment",
    title: "Problems by environment",
  }),
  panel({
    id: "successRateDistribution",
    type: "successRateDistribution",
    title: "Success rate",
  }),
  panel({
    id: "testResultSeverities",
    type: "testResultSeverities",
    title: "Results by severity",
  }),
  panel({ id: "statusTransitions", type: "statusTransitions", title: "Status transitions" }),
  panel({
    id: "testBaseGrowthDynamics",
    type: "testBaseGrowthDynamics",
    title: "Test base growth",
  }),
  panel({ id: "statusDynamics", type: "statusDynamics", title: "Status dynamics" }),
  panel({
    id: "stabilityByComponent",
    type: "stabilityDistribution",
    groupBy: "label-name:component",
    title: "Stability by component",
  }),
  panel({
    id: "stabilityByFeature",
    type: "stabilityDistribution",
    groupBy: "feature",
    title: "Stability by feature",
  }),
  panel({
    id: "stabilityByEpic",
    type: "stabilityDistribution",
    groupBy: "epic",
    title: "Stability by epic",
  }),
  panel({
    id: "stabilityByStory",
    type: "stabilityDistribution",
    groupBy: "story",
    title: "Stability by story",
  }),
  panel({
    id: "allureQualityGate",
    type: "qualityGate",
    title: "Allure quality gate",
  }),
  panel({
    id: "sonarQualityGate",
    type: "qualityGate",
    title: "Sonar quality gate",
  }),
  panel({
    id: "testsTable",
    type: "testsTable",
    title: "Tests table",
  }),
]);

export const PANEL_META: Readonly<Record<string, PanelMeta>> = Object.freeze(
  Object.fromEntries(PANEL_CATALOG.map((p) => [p.id, p])),
);

/** Chart types known to the catalog (unique `type` values). */
export const CHART_TYPES: ReadonlySet<string> = Object.freeze(
  new Set(PANEL_CATALOG.map((p) => p.type)),
);

/**
 * Resolve palette meta by id, or by type + groupBy/by.
 */
export function resolvePanelMeta(
  raw: Partial<ChartItem> & { id?: string },
): PanelMeta | undefined {
  if (raw.id && PANEL_META[raw.id]) return PANEL_META[raw.id];
  const type = raw.type === "pie" ? "currentStatus" : raw.type || "";
  const groupBy = raw.groupBy || undefined;
  const by = raw.by || undefined;
  const exact = PANEL_CATALOG.find(
    (p) =>
      p.type === type &&
      (p.groupBy || undefined) === groupBy &&
      (p.by || undefined) === by,
  );
  if (exact) return exact;
  return PANEL_CATALOG.find((p) => p.type === type && !p.groupBy && !p.by);
}
