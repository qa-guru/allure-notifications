/**
 * Browser-safe collage palette + testing-pyramid geometry.
 *
 * Synced into `apps/builder/vendor/allure-report-kit-collage/` — see builder
 * `scripts/sync-kit-collage.mjs`.
 */
export { CORNER_RATIO, TIER_GAP_RATIO, MAX_WIDTH_FRACTION, MIN_WIDTH_FRACTION, MIN_TIERS_FOR_HEIGHT, MAX_TIER_HEIGHT, MIN_BAND_WIDTH, tierGapPx, tierCornerRadius, } from "./testing-pyramid-geometry.js";
export { LAYER_ORDER, OTHER_LAYER, STATUS_COLORS, STATUS_MAPPING, PYRAMID_COLORS_LIGHT, PYRAMID_COLORS_DARK, PYRAMID_COLORS, colorForLayer, isKnownLayer, } from "./collage-palette.js";
