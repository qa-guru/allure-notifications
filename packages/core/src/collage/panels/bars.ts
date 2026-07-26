/**
 * Rounded bar helpers — port of Java Bars + HorizontalBarRows + PanelPlotArea.
 */

import type { SKRSContext2D } from "@napi-rs/canvas";

export const MARGIN = 16;
export const TITLE_HEIGHT = 24;
export const DEFAULT_ARC = 10;

const MIN_ROW_HEIGHT = 14;
const MAX_ROW_HEIGHT = 34;
const MAX_BAR_HEIGHT = 18;

export function chartTop(showTitle: boolean): number {
  return showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
}

export function chartHeight(height: number, showTitle: boolean): number {
  return Math.max(1, height - MARGIN - chartTop(showTitle));
}

export type HorizontalBarLayout = {
  chartTop: number;
  rowHeight: number;
  gap: number;
  barHeight: number;
  fontSize: number;
  rowTop: (index: number) => number;
  barTop: (index: number) => number;
  textBaseline: (index: number, ascent: number, descent: number) => number;
};

export function horizontalBarRowsLayout(
  height: number,
  showTitle: boolean,
  rowCount: number,
): HorizontalBarLayout {
  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const n = Math.max(1, rowCount);
  const gap = n <= 1 ? 0 : Math.max(2, Math.floor(plotH / (n * 10)));
  const rowHeight = Math.max(
    MIN_ROW_HEIGHT,
    Math.min(MAX_ROW_HEIGHT, Math.floor((plotH - gap * (n - 1)) / n)),
  );
  const barHeight = Math.max(
    4,
    Math.min(MAX_BAR_HEIGHT, Math.round(rowHeight * 0.52)),
  );
  const fontSize = Math.max(9, Math.min(13, rowHeight - 5));
  return {
    chartTop: top,
    rowHeight,
    gap,
    barHeight,
    fontSize,
    rowTop: (index) => top + index * (rowHeight + gap),
    barTop: (index) =>
      top + index * (rowHeight + gap) + Math.floor((rowHeight - barHeight) / 2),
    textBaseline: (index, ascent, descent) => {
      const rowTopY = top + index * (rowHeight + gap);
      return rowTopY + (rowHeight + ascent - descent) / 2;
    },
  };
}

export function fillTopRounded(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  maxArc: number,
): void {
  fillVerticalEnd(ctx, x, y, width, height, maxArc, true, false);
}

export function fillStackedVertical(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  maxArc: number,
  roundTop: boolean,
  roundBottom: boolean,
): void {
  if (width <= 0 || height <= 0) return;
  fillVerticalEnd(ctx, x, y, width, height, maxArc, roundTop, roundBottom);
}

function cornerRadius(maxArc: number, width: number, height: number): number {
  return Math.max(0, Math.min(maxArc, Math.min(width / 2, height / 2)));
}

function fillVerticalEnd(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  maxArc: number,
  roundTop: boolean,
  roundBottom: boolean,
): void {
  if (width <= 0 || height <= 0) return;
  const rTop = roundTop ? cornerRadius(maxArc, width, height) : 0;
  const rBot = roundBottom ? cornerRadius(maxArc, width, height) : 0;
  if (rTop === 0 && rBot === 0) {
    ctx.fillRect(x, y, width, height);
    return;
  }
  const x2 = x + width;
  const y2 = y + height;
  ctx.beginPath();
  ctx.moveTo(x + rTop, y);
  ctx.lineTo(x2 - rTop, y);
  if (rTop > 0) {
    ctx.quadraticCurveTo(x2, y, x2, y + rTop);
  }
  ctx.lineTo(x2, y2 - rBot);
  if (rBot > 0) {
    ctx.quadraticCurveTo(x2, y2, x2 - rBot, y2);
  }
  ctx.lineTo(x + rBot, y2);
  if (rBot > 0) {
    ctx.quadraticCurveTo(x, y2, x, y2 - rBot);
  }
  ctx.lineTo(x, y + rTop);
  if (rTop > 0) {
    ctx.quadraticCurveTo(x, y, x + rTop, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** Horizontal bar with fully rounded caps (pill). */
export function fillPill(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (width <= 0 || height <= 0) return;
  const arc = Math.min(height, width);
  const r = arc / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  ctx.fill();
}

/**
 * Pixel heights for a vertical stack that must fill plotHeight exactly.
 */
export function stackedSegmentHeights(
  plotHeight: number,
  values: number[],
): number[] {
  if (plotHeight <= 0 || values.length === 0) {
    return [];
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  if (total <= 0) {
    return [];
  }
  const n = values.length;
  const heights = new Array<number>(n);
  let remaining = plotHeight;
  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      heights[i] = remaining;
      break;
    }
    const minTail = n - i - 1;
    let height = Math.floor((values[i]! * plotHeight) / total);
    height = Math.max(1, height);
    height = Math.min(height, Math.max(1, remaining - minTail));
    heights[i] = height;
    remaining -= height;
  }
  return heights;
}
