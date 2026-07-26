/**
 * Horizontal suite bars — port of Java SuitesPanel.
 */

import { createCanvas } from "@napi-rs/canvas";

import { rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  MARGIN,
  TITLE_HEIGHT,
  fillPill,
  horizontalBarRowsLayout,
} from "./bars.js";

function truncate(value: string | null | undefined, maxLength: number): string {
  if (value == null) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

export function renderSuitesPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const suites = analytics.suites;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Suites", MARGIN, MARGIN + 12);
  }

  if (suites.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No suite data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  let maxCount = 1;
  for (const suite of suites) {
    maxCount = Math.max(maxCount, suite.count);
  }

  const chartWidth = width - MARGIN * 2;
  const labelWidth = Math.min(180, Math.floor(chartWidth / 3));
  const barAreaWidth = chartWidth - labelWidth - 40;
  const layout = horizontalBarRowsLayout(height, showTitle, suites.length);
  ctx.font = `${layout.fontSize}px sans-serif`;
  const ascent = layout.fontSize * 0.8;
  const descent = layout.fontSize * 0.2;

  suites.forEach((suite, index) => {
    const label = truncate(suite.name, 24);
    const baseline = layout.textBaseline(index, ascent, descent);
    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(label, MARGIN, baseline);

    const barWidth = Math.floor((suite.count / maxCount) * barAreaWidth);
    const barX = MARGIN + labelWidth;
    ctx.fillStyle = rgbCss(theme.accent);
    fillPill(ctx, barX, layout.barTop(index), Math.max(barWidth, 2), layout.barHeight);

    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(String(suite.count), barX + barWidth + 6, baseline);
  });

  return canvas.toBuffer("image/png");
}
