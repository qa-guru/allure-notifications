/**
 * Panel catalog extracted from allure-notifications-builder `js/app.js`.
 * 17 slots ↔ awesome-charts / ChartType (+ groupBy / by variants).
 */
/** @type {ReadonlyArray<PanelMeta>} */
export const PANEL_CATALOG = Object.freeze([
    { id: "pie", type: "pie", title: "Current status", hint: "2×2", defaultW: 2, defaultH: 2 },
    {
        id: "testingPyramid",
        type: "testingPyramid",
        title: "Testing pyramid",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "durationsByLayer",
        type: "durations",
        groupBy: "layer",
        title: "Durations by layer",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "durationDynamics",
        type: "durationDynamics",
        title: "Duration dynamics",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "statusAgePyramid",
        type: "statusAgePyramid",
        title: "Status age pyramid",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "durations",
        type: "durations",
        title: "Durations",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "coverageDiff",
        type: "coverageDiff",
        title: "Coverage diff",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "problemsDistribution",
        type: "problemsDistribution",
        by: "environment",
        title: "Problems by environment",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "successRateDistribution",
        type: "successRateDistribution",
        title: "Success rate",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "testResultSeverities",
        type: "testResultSeverities",
        title: "Results by severity",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "statusTransitions",
        type: "statusTransitions",
        title: "Status transitions",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "testBaseGrowthDynamics",
        type: "testBaseGrowthDynamics",
        title: "Test base growth",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "statusDynamics",
        type: "statusDynamics",
        title: "Status dynamics",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "stabilityByComponent",
        type: "stabilityDistribution",
        groupBy: "label-name:component",
        title: "Stability by component",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "stabilityByFeature",
        type: "stabilityDistribution",
        groupBy: "feature",
        title: "Stability by feature",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "stabilityByEpic",
        type: "stabilityDistribution",
        groupBy: "epic",
        title: "Stability by epic",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
    {
        id: "stabilityByStory",
        type: "stabilityDistribution",
        groupBy: "story",
        title: "Stability by story",
        hint: "2×2",
        defaultW: 2,
        defaultH: 2,
    },
]);
export const PANEL_META = Object.freeze(Object.fromEntries(PANEL_CATALOG.map((p) => [p.id, p])));
/** Chart types known to the catalog (unique `type` values). */
export const CHART_TYPES = Object.freeze(new Set(PANEL_CATALOG.map((p) => p.type)));
/**
 * Resolve palette meta by id, or by type + groupBy/by (pie ↔ currentStatus).
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
    if (type === "currentStatus")
        return PANEL_META.pie;
    return PANEL_CATALOG.find((p) => p.type === type && !p.groupBy && !p.by);
}
