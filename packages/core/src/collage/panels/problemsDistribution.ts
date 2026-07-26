/**
 * Problems distribution heatmap (by: environment).
 * Data: history.jsonl failed+broken counts per environment × run.
 */

import { createCanvas } from "@napi-rs/canvas";

import { isHistoryEmpty } from "../../report/history.js";
import { rgbCss, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { MARGIN, TITLE_HEIGHT, chartHeight, chartTop } from "./bars.js";

function heatColor(value: number, max: number): Rgb {
  if (value <= 0 || max <= 0) {
    return { r: 70, g: 70, b: 74 };
  }
  const t = Math.min(1, value / max);
  // Warm red scale (matches builder mock hue).
  return {
    r: Math.round(220 + 20 * t),
    g: Math.round(140 - 70 * t),
    b: Math.round(100 - 60 * t),
  };
}

export function renderProblemsDistributionPanel(
  context: PanelContext,
): Buffer {
  const { width, height, theme, analytics, showTitle, by } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Problems by environment", MARGIN, MARGIN + 12);
  }

  // Catalog locks by: environment — other `by` values still use env matrix.
  void by;

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const problems = history!.problemsByEnvironment;
  if (problems.environments.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No environment data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const rows = problems.environments.length;
  const cols = problems.matrix[0]?.length ?? 0;
  if (cols === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No environment data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  let max = 1;
  for (const row of problems.matrix) {
    for (const v of row) max = Math.max(max, v);
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const labelW = Math.min(72, Math.floor((width - MARGIN * 2) * 0.28));
  const gap = 3;
  const cellW =
    (width - MARGIN * 2 - labelW - gap * (cols - 1)) / cols;
  const cellH = (plotH - gap * (rows - 1)) / rows;

  ctx.font = "10px sans-serif";
  for (let ri = 0; ri < rows; ri++) {
    const y = top + ri * (cellH + gap);
    const label = problems.environments[ri]!;
    const short =
      label.length > 10 ? `${label.slice(0, 9)}…` : label;
    ctx.fillStyle = rgbCss(
      theme.dark ? { r: 150, g: 150, b: 150 } : { r: 138, g: 148, b: 166 },
    );
    ctx.fillText(short, MARGIN, y + cellH / 2 + 3);

    const row = problems.matrix[ri]!;
    for (let ci = 0; ci < cols; ci++) {
      const x = MARGIN + labelW + ci * (cellW + gap);
      const val = row[ci] ?? 0;
      ctx.fillStyle = rgbCss(heatColor(val, max));
      const r = Math.min(5, cellW / 2, cellH / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + cellW, y, x + cellW, y + cellH, r);
      ctx.arcTo(x + cellW, y + cellH, x, y + cellH, r);
      ctx.arcTo(x, y + cellH, x, y, r);
      ctx.arcTo(x, y, x + cellW, y, r);
      ctx.closePath();
      ctx.fill();
    }
  }

  return canvas.toBuffer("image/png");
}
