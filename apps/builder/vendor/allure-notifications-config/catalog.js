/**
 * Panel catalog extracted from allure-notifications-builder `js/app.js`.
 * 17 slots ↔ awesome-charts / ChartType (+ groupBy / by variants).
 */
/**
 * Palette add footprint is always 2×2 (`defaultW` / `defaultH`).
 * `hint` = panel title (palette caption under thumb).
 * Grid layout footprints live only in `DEFAULT_ITEMS` / vector `items` — never here.
 */
const PALETTE_W = 2;
const PALETTE_H = 2;
function panel(seed) {
    return {
        ...seed,
        hint: seed.title,
        defaultW: PALETTE_W,
        defaultH: PALETTE_H,
    };
}
/** @type {ReadonlyArray<PanelMeta>} */
export const PANEL_CATALOG = Object.freeze([
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
]);
export const PANEL_META = Object.freeze(Object.fromEntries(PANEL_CATALOG.map((p) => [p.id, p])));
/** Chart types known to the catalog (unique `type` values). */
export const CHART_TYPES = Object.freeze(new Set(PANEL_CATALOG.map((p) => p.type)));
/**
 * Resolve palette meta by id, or by type + groupBy/by.
 */
export function resolvePanelMeta(raw) {
    if (raw.id && PANEL_META[raw.id])
        return PANEL_META[raw.id];
    const type = raw.type || "";
    const groupBy = raw.groupBy || undefined;
    const by = raw.by || undefined;
    const exact = PANEL_CATALOG.find((p) => p.type === type &&
        (p.groupBy || undefined) === groupBy &&
        (p.by || undefined) === by);
    if (exact)
        return exact;
    return PANEL_CATALOG.find((p) => p.type === type && !p.groupBy && !p.by);
}
