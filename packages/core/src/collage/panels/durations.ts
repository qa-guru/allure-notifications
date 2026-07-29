/**
 * Durations histogram / by-layer bars — port of Java DurationsPanel.
 */

import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import {
  LAYER_ORDER,
  colorForLayer,
} from "@allure-notifications/pyramid";

import { hexToRgb, rgbCss, type ChartTheme } from "../../theme.js";
import type { PanelContext } from "../context.js";

const MARGIN = 16;
const TITLE_HEIGHT = 24;
const DEFAULT_BINS = 10;
const DEFAULT_ARC = 10;

function isLayerGroupBy(groupBy: string | undefined): boolean {
  return groupBy != null && groupBy.trim().toLowerCase() === "layer";
}

function averageSecondsByLayer(
  byLayer: Record<string, number[]>,
): Map<string, number> {
  const averages = new Map<string, number>();
  const keys: string[] = [];
  for (let i = LAYER_ORDER.length - 1; i >= 0; i--) {
    const ordered = LAYER_ORDER[i]!;
    if (ordered in byLayer) {
      keys.push(ordered);
    }
  }
  for (const key of Object.keys(byLayer)) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }
  for (const key of keys) {
    const samples = byLayer[key];
    if (!samples || samples.length === 0) {
      continue;
    }
    const sum = samples.reduce((a, b) => a + b, 0);
    averages.set(key, sum / samples.length / 1000);
  }
  return averages;
}

function histogram(values: number[], bins: number): number[] {
  let min = values[0] ?? 0;
  let max = values[0] ?? 1;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max <= min) {
    max = min + 1;
  }
  const counts = new Array<number>(bins).fill(0);
  const binWidth = (max - min) / bins;
  for (const value of values) {
    let index = Math.floor((value - min) / binWidth);
    if (index >= bins) index = bins - 1;
    if (index < 0) index = 0;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts;
}

function fillTopRounded(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  maxArc: number,
): void {
  if (width <= 0 || height <= 0) {
    return;
  }
  const r = Math.max(0, Math.min(maxArc, Math.min(width / 2, height / 2)));
  /* c8 ignore next 4 — render path always passes maxArc ≥ 2 and positive bar size */
  if (r === 0) {
    ctx.fillRect(x, y, width, height);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function fillPill(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  /* c8 ignore next 3 — callers clamp bar width/height to ≥ 2 */
  if (width <= 0 || height <= 0) {
    return;
  }
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

function chartTop(showTitle: boolean): number {
  return showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
}

function chartHeight(height: number, showTitle: boolean): number {
  return Math.max(1, height - MARGIN - chartTop(showTitle));
}

function drawHistogram(
  ctx: SKRSContext2D,
  theme: ChartTheme,
  width: number,
  height: number,
  showTitle: boolean,
  durationsMs: number[],
): void {
  const values = durationsMs.map((d) => d / 1000);
  const bins = Math.min(DEFAULT_BINS, Math.max(3, Math.floor(values.length / 2)));
  const counts = histogram(values, bins);
  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const chartWidth = width - MARGIN * 2;
  const barWidth = Math.max(1, Math.floor(chartWidth / bins));
  const maxCount = Math.max(1, ...counts);
  const arc = Math.min(DEFAULT_ARC, Math.max(2, Math.floor(barWidth / 2)));

  ctx.fillStyle = rgbCss(theme.accent);
  for (let index = 0; index < bins; index++) {
    const count = counts[index] ?? 0;
    const barHeight =
      count <= 0
        ? 0
        : Math.max(1, Math.round((count / maxCount) * plotH));
    const x = MARGIN + index * barWidth;
    const y = top + plotH - barHeight;
    const bw = Math.max(barWidth - 2, 1);
    fillTopRounded(ctx, x + 1, y, bw, barHeight, arc);
  }
}

function drawLayerAverages(
  ctx: SKRSContext2D,
  theme: ChartTheme,
  width: number,
  height: number,
  showTitle: boolean,
  avgSeconds: Map<string, number>,
): void {
  const chartWidth = width - MARGIN * 2;
  const labelWidth = Math.min(90, Math.floor(chartWidth / 3));
  const barAreaWidth = Math.max(1, chartWidth - labelWidth - 48);
  let maxAvg = 0.001;
  for (const v of avgSeconds.values()) {
    maxAvg = Math.max(maxAvg, v);
  }

  const n = avgSeconds.size;
  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const rowH = Math.max(14, Math.floor(plotH / Math.max(n, 1)));
  const barH = Math.max(8, Math.floor(rowH * 0.55));
  const fontSize = Math.min(12, Math.max(9, Math.floor(barH)));

  ctx.font = `${fontSize}px sans-serif`;
  let index = 0;
  for (const [key, avg] of avgSeconds) {
    const baseline = top + index * rowH + Math.floor(rowH * 0.7);
    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(key, MARGIN, baseline);
    const barWidth = Math.floor((avg / maxAvg) * barAreaWidth);
    const barX = MARGIN + labelWidth;
    const barY = top + index * rowH + Math.floor((rowH - barH) / 2);
    const hex = colorForLayer(key, theme.dark ? "dark" : "light");
    ctx.fillStyle = hex ? rgbCss(hexToRgb(hex)) : rgbCss(theme.accent);
    fillPill(ctx, barX, barY, Math.max(barWidth, 2), barH);
    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(avg.toFixed(1), barX + barWidth + 6, baseline);
    index++;
  }
}

export function renderDurationsPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle, groupBy } = context;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    const title = isLayerGroupBy(groupBy)
      ? "Durations by layer (s)"
      : "Durations (s)";
    ctx.fillText(title, MARGIN, MARGIN + 12);
  }

  if (isLayerGroupBy(groupBy)) {
    const avg = averageSecondsByLayer(analytics.durationsMsByLayer);
    if (avg.size > 0) {
      drawLayerAverages(ctx, theme, width, height, showTitle, avg);
      return canvas.toBuffer("image/png");
    }
  }

  if (analytics.durationsMs.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No duration data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  drawHistogram(ctx, theme, width, height, showTitle, analytics.durationsMs);
  return canvas.toBuffer("image/png");
}
