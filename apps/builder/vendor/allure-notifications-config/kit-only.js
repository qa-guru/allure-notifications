/**
 * Kit-only collage panel kinds — valid in schema always; runtime silent-skip when
 * `chart.profile !== "kit"` (dispatch lives in core T6, not here).
 */
export const CHART_PROFILE_DEFAULT = "default";
/** Stable kind from kit `PanelKind` / Allure custom panel contract. */
export const KIT_ONLY_PANEL_KIND = "qualityGate";
/** Stable catalog ids from kit overview preset (`allureQualityGate`, `sonarQualityGate`). */
export const KIT_ONLY_PANEL_IDS = ["allureQualityGate", "sonarQualityGate"];
export const KIT_ONLY_PANEL_KINDS = Object.freeze(new Set([KIT_ONLY_PANEL_KIND]));
export const KIT_ONLY_PANEL_ID_SET = Object.freeze(new Set(KIT_ONLY_PANEL_IDS));
export function normalizeChartProfile(profile) {
    return profile === "kit" ? "kit" : CHART_PROFILE_DEFAULT;
}
export function isKitOnlyPanelType(type) {
    if (!type) {
        return false;
    }
    return type.trim() === KIT_ONLY_PANEL_KIND;
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
