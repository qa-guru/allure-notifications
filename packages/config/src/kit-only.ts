/**
 * Kit-only collage panel kinds — valid in schema always; runtime silent-skip when
 * `chart.profile !== "kit"` (dispatch lives in core T6, not here).
 */

import type { ChartItem } from "./catalog.js";

export const CHART_PROFILE_DEFAULT = "default" as const;
export type ChartProfile = "default" | "kit";

/** Stable kind from kit `PanelKind` / Allure custom panel contract. */
export const KIT_ONLY_PANEL_KIND = "qualityGate" as const;

/** Stable catalog ids from kit overview preset (`allureQualityGate`, `sonarQualityGate`). */
export const KIT_ONLY_PANEL_IDS = ["allureQualityGate", "sonarQualityGate"] as const;
export type KitOnlyPanelId = (typeof KIT_ONLY_PANEL_IDS)[number];

export const KIT_ONLY_PANEL_KINDS: ReadonlySet<string> = Object.freeze(
  new Set<string>([KIT_ONLY_PANEL_KIND]),
);

export const KIT_ONLY_PANEL_ID_SET: ReadonlySet<string> = Object.freeze(
  new Set<string>(KIT_ONLY_PANEL_IDS),
);

export function normalizeChartProfile(
  profile: string | undefined | null,
): ChartProfile {
  return profile === "kit" ? "kit" : CHART_PROFILE_DEFAULT;
}

export function isKitOnlyPanelType(type: string | undefined | null): boolean {
  if (!type) {
    return false;
  }
  return type.trim() === KIT_ONLY_PANEL_KIND;
}

export function isKitOnlyPanelId(id: string | undefined | null): boolean {
  if (!id) {
    return false;
  }
  return KIT_ONLY_PANEL_ID_SET.has(id);
}

export function isKitOnlyChartItem(
  item: Partial<ChartItem> & { id?: string },
): boolean {
  return isKitOnlyPanelType(item.type) || isKitOnlyPanelId(item.id);
}

/**
 * True when collage dispatch should silent-skip this item (profile default + kit-only).
 * T6 collage wire consumes this; config package does not render.
 */
export function shouldSilentSkipKitOnlyItem(
  profile: ChartProfile | string | undefined | null,
  item: Partial<ChartItem> & { id?: string },
): boolean {
  return normalizeChartProfile(profile) !== "kit" && isKitOnlyChartItem(item);
}
