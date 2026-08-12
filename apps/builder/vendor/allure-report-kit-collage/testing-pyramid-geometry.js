/**
 * Rounded-tier geometry for collage testing pyramid panels.
 *
 * Locked with Java `TestingPyramidPanel` and canon CANON.md (5.0.3+):
 * equal-height tiers; only width steps; count lives in the label.
 *
 * Report SVG (`testingPyramid` chart) uses different geometry — DS `widget-tile-mocks`
 * (`rx=4`, `minFrac=0.2`); these constants are collage-only.
 */
/** Corner radius as a fraction of tier height (quiet, not capsule). */
export const CORNER_RATIO = 0.18;
/** Vertical gap between tiers as a fraction of band height. */
export const TIER_GAP_RATIO = 0.11;
/** Widest (unit) tier width as a fraction of chart width. */
export const MAX_WIDTH_FRACTION = 0.92;
/** Narrowest known-layer (manual) tier width as a fraction of chart width. */
export const MIN_WIDTH_FRACTION = 0.3;
/** Floor of vertical slots so 1–2 layers stay a compact centred stack. */
export const MIN_TIERS_FOR_HEIGHT = 4;
/** Cap a single tier so tall panels don't stretch it edge-to-edge. */
export const MAX_TIER_HEIGHT = 160;
/** Minimum painted tier width in px. */
export const MIN_BAND_WIDTH = 24;
/**
 * Gap in px between neighbouring tiers for a given band height.
 * Mirrors Java: `max(2, round(bandHeight * TIER_GAP_RATIO))`.
 */
export function tierGapPx(bandHeight) {
    return Math.max(2, Math.round(bandHeight * TIER_GAP_RATIO));
}
/**
 * Corner radius in px for a painted tier.
 * Mirrors Java: `min(halfW, halfH, tierHeight * CORNER_RATIO)`.
 */
export function tierCornerRadius(bandWidth, tierHeight) {
    return Math.min(Math.min(bandWidth / 2, tierHeight / 2), tierHeight * CORNER_RATIO);
}
