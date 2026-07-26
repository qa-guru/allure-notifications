/**
 * Test base growth — added ↑ / removed ↓ between consecutive history runs.
 */

import { createCanvas } from "@napi-rs/canvas";

import { isHistoryEmpty } from "../../report/history.js";
import { STATUS_RGB, rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  DEFAULT_ARC,
  MARGIN,
  TITLE_HEIGHT,
  chartHeight,
  chartTop,
  fillStackedVertical,
} from "./bars.js";

export function renderTestBaseGrowthPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Test base growth", MARGIN, MARGIN + 12);
  }

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const points = history!.testBaseGrowth;
  if (points.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No growth data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  let maxUp = 1;
  let maxDown = 1;
  for (const p of points) {
    maxUp = Math.max(maxUp, p.added);
    maxDown = Math.max(maxDown, p.removed);
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const mid = top + plotH * 0.62;
  const upH = mid - top;
  const downH = top + plotH - mid;
  const chartWidth = width - MARGIN * 2;
  const n = points.length;
  const slot = Math.max(1, Math.floor(chartWidth / n));
  const barWidth = Math.max(1, Math.min(slot - 4, slot));

  ctx.strokeStyle = rgbCss(
    theme.dark ? { r: 150, g: 150, b: 150 } : { r: 138, g: 148, b: 166 },
  );
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, mid);
  ctx.lineTo(width - MARGIN, mid);
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    const x = MARGIN + i * slot + Math.floor((slot - barWidth) / 2);
    if (p.added > 0) {
      const h = Math.max(1, Math.round((p.added / maxUp) * upH));
      ctx.fillStyle = rgbCss(STATUS_RGB.passed);
      fillStackedVertical(ctx, x, mid - h, barWidth, h, DEFAULT_ARC, true, true);
    }
    if (p.removed > 0) {
      const h = Math.max(1, Math.round((p.removed / maxDown) * downH));
      ctx.fillStyle = rgbCss(STATUS_RGB.failed);
      fillStackedVertical(ctx, x, mid, barWidth, h, DEFAULT_ARC, true, true);
    }
  }

  return canvas.toBuffer("image/png");
}
