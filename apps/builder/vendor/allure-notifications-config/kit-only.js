/**
 * Kit-only collage panel kinds — valid in schema always; runtime silent-skip when
 * `chart.profile !== "kit"` (dispatch lives in core T6, not here).
 */
export const CHART_PROFILE_DEFAULT = "default";
/** Kit-only kinds from `PanelKind` / Allure custom panel contract. */
export const KIT_ONLY_PANEL_KINDS_LIST = ["qualityGate", "testsTable"];
/** First kit-only kind — backward-compatible export. */
export const KIT_ONLY_PANEL_KIND = "qualityGate";
/** Stable catalog ids from kit overview preset. */
export const KIT_ONLY_PANEL_IDS = [
    "allureQualityGate",
    "sonarQualityGate",
    "testsTable",
];
export const KIT_ONLY_PANEL_KINDS = Object.freeze(new Set(KIT_ONLY_PANEL_KINDS_LIST));
export const KIT_ONLY_PANEL_ID_SET = Object.freeze(new Set(KIT_ONLY_PANEL_IDS));
export function normalizeChartProfile(profile) {
    return profile === "kit" ? "kit" : CHART_PROFILE_DEFAULT;
}
export function isKitOnlyPanelType(type) {
    if (!type) {
        return false;
    }
    return KIT_ONLY_PANEL_KINDS.has(type.trim());
}
export function isKitOnlyPanelId(id) {
    if (!id) {
        return false;
    }
    return KIT_ONLY_PANEL_ID_SET.has(id);
}
export function isKitOnlyChartItem(item) {
    return isKitOnlyPanelType(item.type) || isKitOnlyPanelId(item.id);
}
/**
 * True when collage dispatch should silent-skip this item (profile default + kit-only).
 * T6 collage wire consumes this; config package does not render.
 */
export function shouldSilentSkipKitOnlyItem(profile, item) {
    return normalizeChartProfile(profile) !== "kit" && isKitOnlyChartItem(item);
}
