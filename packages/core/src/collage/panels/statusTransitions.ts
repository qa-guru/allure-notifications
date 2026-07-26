/**
 * Diverging status transitions (fixed ↑ / regressed+malfunctioned ↓).
 * Data: history.jsonl consecutive per-case status changes.
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

const MALFUNCTIONED = { r: 0xff, g: 0x82, b: 0x00 };

export function renderStatusTransitionsPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Status transitions", MARGIN, MARGIN + 12);
  }

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const points = history!.statusTransitions;
  if (points.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No transition data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  let maxUp = 1;
  let maxDown = 1;
  for (const p of points) {
    maxUp = Math.max(maxUp, p.fixed);
    maxDown = Math.max(maxDown, p.regressed + p.malfunctioned);
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const mid = top + plotH / 2;
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
    if (p.fixed > 0) {
      const h = Math.max(1, Math.round((p.fixed / maxUp) * upH));
      ctx.fillStyle = rgbCss(STATUS_RGB.passed);
      fillStackedVertical(ctx, x, mid - h, barWidth, h, DEFAULT_ARC, true, false);
    }
    const downSegs: Array<{ h: number; color: typeof STATUS_RGB.failed }> = [];
    if (p.regressed > 0) {
      downSegs.push({
        h: Math.max(1, Math.round((p.regressed / maxDown) * downH)),
        color: STATUS_RGB.failed,
      });
    }
    if (p.malfunctioned > 0) {
      downSegs.push({
        h: Math.max(1, Math.round((p.malfunctioned / maxDown) * downH)),
        color: MALFUNCTIONED,
      });
    }
    let y = mid;
    for (let si = 0; si < downSegs.length; si++) {
      const seg = downSegs[si]!;
      ctx.fillStyle = rgbCss(seg.color);
      fillStackedVertical(
        ctx,
        x,
        y,
        barWidth,
        seg.h,
        DEFAULT_ARC,
        false,
        si === downSegs.length - 1,
      );
      y += seg.h;
    }
  }

  return canvas.toBuffer("image/png");
}
