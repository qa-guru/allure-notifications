/**
 * Status age pyramid — funnel bands by consecutive non-passed age × status.
 * Data: history.jsonl trailing status streak from latest run.
 */

import { createCanvas } from "@napi-rs/canvas";

import { isHistoryEmpty } from "../../report/history.js";
import { STATUS_RGB, rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { DEFAULT_ARC, MARGIN, TITLE_HEIGHT, chartTop } from "./bars.js";

const ORDER = ["failed", "broken", "skipped", "unknown"] as const;

function statusColor(status: (typeof ORDER)[number]) {
  return STATUS_RGB[status];
}

export function renderStatusAgePyramidPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Status age pyramid", MARGIN, MARGIN + 12);
  }

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const buckets = history!.statusAgePyramid;
  const totals = buckets.map(
    (b) => b.failed + b.broken + b.skipped + b.unknown,
  );
  const max = Math.max(1, ...totals);
  if (totals.every((t) => t === 0)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No age data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const top = chartTop(showTitle);
  const padB = MARGIN;
  const gap = 6;
  const n = buckets.length;
  const bandH = Math.max(8, (height - top - padB - gap * (n - 1)) / n);
  const cx = width / 2;
  const fullW = width - MARGIN * 2;

  for (let i = 0; i < n; i++) {
    const b = buckets[i]!;
    const total = totals[i]!;
    const y = top + i * (bandH + gap);
    if (total <= 0) continue;
    const w = (total / max) * fullW;
    let x = cx - w / 2;
    const segs: Array<{ status: (typeof ORDER)[number]; sw: number }> = [];
    for (const status of ORDER) {
      const count = b[status];
      if (count > 0) {
        segs.push({ status, sw: (count / total) * w });
      }
    }
    for (let si = 0; si < segs.length; si++) {
      const seg = segs[si]!;
      const rL = si === 0 ? Math.min(DEFAULT_ARC, seg.sw / 2, bandH / 2) : 0;
      const rR =
        si === segs.length - 1
          ? Math.min(DEFAULT_ARC, seg.sw / 2, bandH / 2)
          : 0;
      ctx.fillStyle = rgbCss(statusColor(seg.status));
      ctx.beginPath();
      ctx.moveTo(x + rL, y);
      ctx.lineTo(x + seg.sw - rR, y);
      if (rR > 0) {
        ctx.quadraticCurveTo(x + seg.sw, y, x + seg.sw, y + rR);
      } else {
        ctx.lineTo(x + seg.sw, y);
      }
      ctx.lineTo(x + seg.sw, y + bandH - rR);
      if (rR > 0) {
        ctx.quadraticCurveTo(
          x + seg.sw,
          y + bandH,
          x + seg.sw - rR,
          y + bandH,
        );
      } else {
        ctx.lineTo(x + seg.sw, y + bandH);
      }
      ctx.lineTo(x + rL, y + bandH);
      if (rL > 0) {
        ctx.quadraticCurveTo(x, y + bandH, x, y + bandH - rL);
      } else {
        ctx.lineTo(x, y + bandH);
      }
      ctx.lineTo(x, y + rL);
      if (rL > 0) {
        ctx.quadraticCurveTo(x, y, x + rL, y);
      } else {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      x += seg.sw;
    }

    if (bandH >= 14 && w > 40) {
      ctx.fillStyle = "rgba(0,0,0,0.72)";
      ctx.font = "bold 11px sans-serif";
      const label = b.label;
      const tw = ctx.measureText(label).width;
      ctx.fillText(label, cx - tw / 2, y + bandH / 2 + 4);
    }
  }

  return canvas.toBuffer("image/png");
}
