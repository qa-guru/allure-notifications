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

export type PyramidTheme = "light" | "dark";

export type KnownLayer =
  | "unit"
  | "component"
  | "integration"
  | "api"
  | "e2e"
  | "manual";

export type LayerKey = KnownLayer | "other";

/** Bottom → tip band order (unit widest … manual narrowest). */
export const LAYER_ORDER: readonly KnownLayer[] = [
  "unit",
  "component",
  "integration",
  "api",
  "e2e",
  "manual",
] as const;

/** Aggregate bucket for non-SSOT layer values (gray top band). */
export const OTHER_LAYER: LayerKey = "other";

/** Pie / Allure 3 status colors (shared with pyramid `unit` = passed). */
export const STATUS_COLORS = {
  passed: "#94ca66",
  failed: "#ff5744",
  broken: "#ffce57",
  skipped: "#aaaaaa",
  unknown: "#d861be",
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

/** Layer → pie status / brand mapping (informational; matches SSOT). */
export const STATUS_MAPPING = {
  unit: "passed",
  e2e: "failed",
  api: "broken",
  integration: "unknown",
  other: "skipped",
  component: "brand-orange",
  manual: "brand-blue",
} as const;

/** Light theme layer fills (unit = pie passed). */
export const PYRAMID_COLORS_LIGHT: Record<LayerKey, string> = {
  unit: STATUS_COLORS.passed,
  component: "#ff8200",
  integration: "#7e22ce",
  api: "#e8bd00",
  e2e: "#dc2626",
  manual: "#459bde",
  other: "#64748b",
};

/** Dark theme layer fills (unit = pie passed). */
export const PYRAMID_COLORS_DARK: Record<LayerKey, string> = {
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
} as const;

export function colorForLayer(
  layer: string,
  theme: PyramidTheme = "light",
): string | null {
  const key = layer.trim().toLowerCase() as LayerKey;
  const palette = PYRAMID_COLORS[theme];
  return palette[key] ?? null;
}

export function isKnownLayer(layer: string): layer is KnownLayer {
  const key = layer.trim().toLowerCase();
  return (LAYER_ORDER as readonly string[]).includes(key);
}
