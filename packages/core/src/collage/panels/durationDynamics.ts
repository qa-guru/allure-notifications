/**
 * Duration dynamics — average duration (ms) per history run as line+area.
 */

import { rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { MARGIN, chartHeight, chartTop } from "./bars.js";
import { openHistoryPanel, paintPanelMessage } from "./panelFrame.js";

export function renderDurationDynamicsPanel(context: PanelContext): Buffer {
  const opened = openHistoryPanel(context, "Duration dynamics");
  if (opened.empty) return opened.png;
  const { canvas, ctx, history, width, height, showTitle, theme } = opened;

  const values = history.durationDynamics;
  if (values.length === 0) {
    return paintPanelMessage(ctx, theme, canvas, "No duration data");
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const plotW = width - MARGIN * 2;
  const max = Math.max(...values, 1);
  const min = 0;
  const n = values.length;
  const pts = values.map((val, i) => {
    const x =
      n === 1 ? MARGIN + plotW / 2 : MARGIN + (i / (n - 1)) * plotW;
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
