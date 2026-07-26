/**
 * Stability distribution bars by label (feature/epic/story/component).
 * Prefers history.stabilityCases; falls back to current-results samples.
 */

import { createCanvas } from "@napi-rs/canvas";

import {
  STABILITY_THRESHOLD,
  isHistoryEmpty,
  stabilityBarsFromCases,
} from "../../report/history.js";
import { STATUS_RGB, rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  DEFAULT_ARC,
  MARGIN,
  TITLE_HEIGHT,
  chartHeight,
  chartTop,
  fillTopRounded,
} from "./bars.js";

function rateColor(rate: number) {
  if (rate >= STABILITY_THRESHOLD) return STATUS_RGB.passed;
  if (rate >= 80) return STATUS_RGB.broken;
  return STATUS_RGB.failed;
}

export function renderStabilityDistributionPanel(
  context: PanelContext,
): Buffer {
  const { width, height, theme, analytics, showTitle, groupBy } = context;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Stability distribution", MARGIN, MARGIN + 12);
  }

  const historyCases = !isHistoryEmpty(analytics.history)
    ? analytics.history!.stabilityCases
    : [];
  const cases =
    historyCases.length > 0 ? historyCases : analytics.stabilityCases;
  const bars = stabilityBarsFromCases(cases, groupBy);

  if (bars.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No stability data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const chartWidth = width - MARGIN * 2;
  const n = bars.length;
  const slot = Math.max(1, Math.floor(chartWidth / n));
  const barWidth = Math.max(1, Math.min(slot - 3, slot));
  const arc = Math.min(DEFAULT_ARC, Math.max(2, Math.floor(barWidth / 2)));

  // Threshold dashed line at 90%.
  const threshY = top + plotH - (STABILITY_THRESHOLD / 100) * plotH;
  ctx.strokeStyle = rgbCss(
    theme.dark ? { r: 150, g: 150, b: 150 } : { r: 138, g: 148, b: 166 },
  );
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(MARGIN, threshY);
  ctx.lineTo(width - MARGIN, threshY);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < n; i++) {
    const bar = bars[i]!;
    const h = Math.max(1, Math.round((bar.rate / 100) * plotH));
    const x = MARGIN + i * slot + Math.floor((slot - barWidth) / 2);
    const y = top + plotH - h;
    ctx.fillStyle = rgbCss(rateColor(bar.rate));
    fillTopRounded(ctx, x, y, barWidth, h, arc);
  }

  return canvas.toBuffer("image/png");
}
