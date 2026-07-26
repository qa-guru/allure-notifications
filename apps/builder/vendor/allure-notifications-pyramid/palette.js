/**
 * Testing-pyramid palette SSOT (hex strings).
 *
 * Upstream SSOT: `stacks/java-spring/tests/allure/pyramid-layers.json`
 * (verified by monorepo `python scripts/pyramid_palette_sync.py --check`
 * and by this package's unit tests).
 *
 * `unit` deliberately reuses pie success (`STATUS_COLORS.passed` / `#94ca66`)
 * in both themes — do not introduce a separate “accessible” green.
 */
/** Bottom → tip band order (unit widest … manual narrowest). */
export const LAYER_ORDER = [
    "unit",
    "component",
    "integration",
    "api",
    "e2e",
    "manual",
];
/** Aggregate bucket for non-SSOT layer values (gray top band). */
export const OTHER_LAYER = "other";
/** Pie / Allure 3 status colors (shared with pyramid `unit` = passed). */
export const STATUS_COLORS = {
    passed: "#94ca66",
    failed: "#ff5744",
    broken: "#ffce57",
    skipped: "#aaaaaa",
    unknown: "#d861be",
};
/** Layer → pie status / brand mapping (informational; matches SSOT). */
export const STATUS_MAPPING = {
    unit: "passed",
    e2e: "failed",
    api: "broken",
    integration: "unknown",
    other: "skipped",
    component: "brand-orange",
    manual: "brand-blue",
};
/** Light theme layer fills (unit = pie passed). */
export const PYRAMID_COLORS_LIGHT = {
    unit: STATUS_COLORS.passed,
    component: "#ff8200",
    integration: "#7e22ce",
    api: "#e8bd00",
    e2e: "#dc2626",
    manual: "#459bde",
    other: "#64748b",
};
/** Dark theme layer fills (unit = pie passed). */
export const PYRAMID_COLORS_DARK = {
    unit: STATUS_COLORS.passed,
    component: "#ffa833",
    integration: "#a65ac4",
    api: "#ffd833",
    e2e: "#ff574f",
    manual: "#61b6fb",
    other: "#5d6876",
};
export const PYRAMID_COLORS = {
    light: PYRAMID_COLORS_LIGHT,
    dark: PYRAMID_COLORS_DARK,
};
export function colorForLayer(layer, theme = "light") {
    const key = layer.trim().toLowerCase();
    const palette = PYRAMID_COLORS[theme];
    return palette[key] ?? null;
}
export function isKnownLayer(layer) {
    const key = layer.trim().toLowerCase();
    return LAYER_ORDER.includes(key);
}
