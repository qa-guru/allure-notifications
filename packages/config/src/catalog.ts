/**
 * Panel catalog extracted from allure-notifications-builder `js/app.js`.
 * 17 slots ↔ awesome-charts / ChartType (+ groupBy / by variants).
 *
 * Palette add footprint is always 2×2 (`hint` / `defaultW` / `defaultH`).
 * Grid layout footprints live only in `DEFAULT_ITEMS` / vector `items` — never here.
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
  groupBy?: string;
  by?: string;
};

/** Palette / add-from-catalog footprint — not grid preset sizes. */
const PALETTE_W = 2;
const PALETTE_H = 2;
const PALETTE_HINT = "2×2";

/** @type {ReadonlyArray<PanelMeta>} */
export const PANEL_CATALOG: ReadonlyArray<PanelMeta> = Object.freeze([
  {
    id: "pie",
    type: "pie",
    title: "Current status",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "testingPyramid",
    type: "testingPyramid",
    title: "Testing pyramid",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "durationsByLayer",
    type: "durations",
    groupBy: "layer",
    title: "Durations by layer",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "durationDynamics",
    type: "durationDynamics",
    title: "Duration dynamics",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "statusAgePyramid",
    type: "statusAgePyramid",
    title: "Status age pyramid",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "durations",
    type: "durations",
    title: "Durations",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "coverageDiff",
    type: "coverageDiff",
    title: "Coverage diff",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "problemsDistribution",
    type: "problemsDistribution",
    by: "environment",
    title: "Problems by environment",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "successRateDistribution",
    type: "successRateDistribution",
    title: "Success rate",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "testResultSeverities",
    type: "testResultSeverities",
    title: "Results by severity",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "statusTransitions",
    type: "statusTransitions",
    title: "Status transitions",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "testBaseGrowthDynamics",
    type: "testBaseGrowthDynamics",
    title: "Test base growth",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "statusDynamics",
    type: "statusDynamics",
    title: "Status dynamics",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "stabilityByComponent",
    type: "stabilityDistribution",
    groupBy: "label-name:component",
    title: "Stability by component",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "stabilityByFeature",
    type: "stabilityDistribution",
    groupBy: "feature",
    title: "Stability by feature",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "stabilityByEpic",
    type: "stabilityDistribution",
    groupBy: "epic",
    title: "Stability by epic",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
  {
    id: "stabilityByStory",
    type: "stabilityDistribution",
    groupBy: "story",
    title: "Stability by story",
    hint: PALETTE_HINT,
    defaultW: PALETTE_W,
    defaultH: PALETTE_H,
  },
]);

export const PANEL_META: Readonly<Record<string, PanelMeta>> = Object.freeze(
  Object.fromEntries(PANEL_CATALOG.map((p) => [p.id, p])),
);

/** Chart types known to the catalog (unique `type` values). */
export const CHART_TYPES: ReadonlySet<string> = Object.freeze(
  new Set(PANEL_CATALOG.map((p) => p.type)),
);

/**
 * Resolve palette meta by id, or by type + groupBy/by (pie ↔ currentStatus).
 */
export function resolvePanelMeta(
  raw: Partial<ChartItem> & { id?: string },
): PanelMeta | undefined {
  if (raw.id && PANEL_META[raw.id]) return PANEL_META[raw.id];
  const type = raw.type || "";
  const groupBy = raw.groupBy || undefined;
  const by = raw.by || undefined;
  const exact = PANEL_CATALOG.find(
    (p) =>
      p.type === type &&
      (p.groupBy || undefined) === groupBy &&
      (p.by || undefined) === by,
  );
  if (exact) return exact;
  if (type === "currentStatus") return PANEL_META.pie;
  return PANEL_CATALOG.find((p) => p.type === type && !p.groupBy && !p.by);
}
