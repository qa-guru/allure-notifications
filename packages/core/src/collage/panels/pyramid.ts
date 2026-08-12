/**
 * Testing pyramid panel — port of Java TestingPyramidPanel.
 * Geometry + palette from @qa-guru/allure-report-kit.
 */

import { createCanvas } from "@napi-rs/canvas";
import {
  CORNER_RATIO,
  LAYER_ORDER,
  MAX_TIER_HEIGHT,
  MAX_WIDTH_FRACTION,
  MIN_BAND_WIDTH,
  MIN_TIERS_FOR_HEIGHT,
  MIN_WIDTH_FRACTION,
  OTHER_LAYER,
  PYRAMID_COLORS_DARK,
  PYRAMID_COLORS_LIGHT,
  TIER_GAP_RATIO,
  colorForLayer,
  isKnownLayer,
  tierCornerRadius,
  tierGapPx,
  type LayerKey,
} from "@qa-guru/allure-report-kit";

import { hexToRgb, rgbCss, type ChartTheme, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { renderSuitesPanel } from "./suites.js";

const MARGIN = 16;
const TITLE_HEIGHT = 24;
/** Cap tier height in tall collage tiles — geometry SSOT still governs gaps/radius. */
const PREFERRED_BAND_HEIGHT = 52;

export type LayerBreakdown = {
  knownCounts: Map<string, number>;
  unknownCount: number;
};

export function layerBreakdownFrom(
  layers: Record<string, number>,
): LayerBreakdown {
  const knownCounts = new Map<string, number>();
  let unknownCount = 0;
  for (const [raw, count] of Object.entries(layers)) {
    if (!count || count <= 0) {
      continue;
    }
    const key = raw.trim().toLowerCase();
    if (isKnownLayer(key)) {
      knownCounts.set(key, (knownCounts.get(key) ?? 0) + count);
    } else {
      unknownCount += count;
    }
  }
  return { knownCounts, unknownCount };
}

function widthFractionFor(layer: string): number {
  const fullTiers = LAYER_ORDER.length;
  let rankFromBottom = LAYER_ORDER.indexOf(layer as (typeof LAYER_ORDER)[number]);
  if (rankFromBottom < 0) {
    rankFromBottom = fullTiers;
  }
  const span = MAX_WIDTH_FRACTION - MIN_WIDTH_FRACTION;
  const fraction =
    MAX_WIDTH_FRACTION - span * (rankFromBottom / (fullTiers - 1));
  return Math.max(MIN_WIDTH_FRACTION, Math.min(MAX_WIDTH_FRACTION, fraction));
}

function contrastText(fill: Rgb, fallback: Rgb): Rgb {
  const luminance =
    (0.299 * fill.r + 0.587 * fill.g + 0.114 * fill.b) / 255;
  return luminance > 0.6 ? { r: 0, g: 0, b: 0 } : fallback;
}

function darker(c: Rgb): Rgb {
  return {
    r: Math.max(0, Math.round(c.r * 0.7)),
    g: Math.max(0, Math.round(c.g * 0.7)),
    b: Math.max(0, Math.round(c.b * 0.7)),
  };
}

function layerFill(layer: string, theme: ChartTheme): Rgb {
  if (layer === OTHER_LAYER) {
    const hex = theme.dark
      ? PYRAMID_COLORS_DARK.other
      : PYRAMID_COLORS_LIGHT.other;
    return hexToRgb(hex);
  }
  // Known LAYER_ORDER keys always have palette entries; OTHER handled above.
  return hexToRgb(colorForLayer(layer, theme.dark ? "dark" : "light")!);
}

function roundRectPath(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function renderPyramidPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle, config } = context;
  const breakdown = layerBreakdownFrom(analytics.layers);
  const fallback =
    config.base.chart?.pyramidFallback?.trim().toLowerCase() || "suites";
  // Java: no known layers + pyramidFallback=suites → SuitesPanel (not "other"-only pyramid).
  if (!breakdown.knownCounts.size && fallback === "suites") {
    return renderSuitesPanel(context);
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Testing pyramid", MARGIN, MARGIN + 12);
  }

  type Band = { layer: string; count: number };
  const bands: Band[] = [];
  for (const layer of LAYER_ORDER) {
    const count = breakdown.knownCounts.get(layer) ?? 0;
    if (count > 0) {
      bands.push({ layer, count });
    }
  }
  if (breakdown.unknownCount > 0) {
    bands.push({ layer: OTHER_LAYER, count: breakdown.unknownCount });
  }

  if (bands.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No layer data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const chartTop = showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
  const chartHeight = height - chartTop - MARGIN;
  const chartWidth = width - MARGIN * 2;
  const centerX = MARGIN + chartWidth / 2;
  const layerCount = bands.length;

  const heightSlots = Math.max(layerCount, MIN_TIERS_FOR_HEIGHT);
  const bandHeight = Math.min(
    PREFERRED_BAND_HEIGHT,
    Math.floor(chartHeight / heightSlots),
    MAX_TIER_HEIGHT,
  );
  const stackHeight = bandHeight * layerCount;
  let yBottom = chartTop + Math.floor((chartHeight + stackHeight) / 2);

  // Re-export geometry constants usage so tests can assert SSOT wiring.
  void CORNER_RATIO;
  void TIER_GAP_RATIO;

  for (let index = 0; index < layerCount; index++) {
    const band = bands[index]!;
    const yTop = yBottom - bandHeight;
    const widthFraction = widthFractionFor(band.layer);
    const bandWidth = Math.max(
      MIN_BAND_WIDTH,
      Math.floor(chartWidth * widthFraction),
    );
    const gap = tierGapPx(bandHeight);
    const tierTop = yTop + Math.floor(gap / 2);
    const tierHeight = Math.max(1, bandHeight - gap);
    const tierX = centerX - Math.floor(bandWidth / 2);
    const radius = tierCornerRadius(bandWidth, tierHeight);

    const fill = layerFill(band.layer as LayerKey, theme);
    ctx.fillStyle = rgbCss(fill);
    roundRectPath(ctx, tierX, tierTop, bandWidth, tierHeight, radius);
    ctx.fill();
    ctx.strokeStyle = rgbCss(darker(fill));
    ctx.lineWidth = 1;
    roundRectPath(ctx, tierX, tierTop, bandWidth, tierHeight, radius);
    ctx.stroke();

    const label = `${band.layer} (${band.count})`;
    ctx.fillStyle = rgbCss(contrastText(fill, theme.text));
    ctx.font = "10px sans-serif";
    const labelWidth = ctx.measureText(label).width;
    ctx.fillText(
      label,
      centerX - labelWidth / 2,
      tierTop + tierHeight / 2 + 3,
    );

    yBottom = yTop;
  }

  return canvas.toBuffer("image/png");
}

/** Exposed for unit tests — same numbers as @pyramid. */
export const PYRAMID_GEOMETRY = {
  CORNER_RATIO,
  TIER_GAP_RATIO,
  tierGapPx,
  tierCornerRadius,
} as const;
