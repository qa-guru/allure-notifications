/**
 * Duration dynamics — average duration (ms) per history run as line+area.
 */

import { createCanvas } from "@napi-rs/canvas";

import { isHistoryEmpty } from "../../report/history.js";
import { rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { MARGIN, TITLE_HEIGHT, chartHeight, chartTop } from "./bars.js";

export function renderDurationDynamicsPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Duration dynamics", MARGIN, MARGIN + 12);
  }

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const values = history!.durationDynamics;
  if (values.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No duration data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const plotW = width - MARGIN * 2;
  const max = Math.max(...values, 1);
  const min = 0;
  const n = values.length;
  const pts = values.map((val, i) => {
    const x =
      n === 1
        ? MARGIN + plotW / 2
        : MARGIN + (i / (n - 1)) * plotW;
    const y = top + (1 - (val - min) / (max - min)) * plotH;
    return [x, y] as const;
  });

  const info = theme.accent;
  // Area
  ctx.beginPath();
  ctx.moveTo(MARGIN, top + plotH);
  for (const [x, y] of pts) {
    ctx.lineTo(x, y);
  }
  ctx.lineTo(MARGIN + plotW, top + plotH);
  ctx.closePath();
  ctx.fillStyle = `rgba(${info.r},${info.g},${info.b},0.16)`;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = rgbCss(info);
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  for (const [x, y] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgbCss(info);
    ctx.fill();
  }

  return canvas.toBuffer("image/png");
}
