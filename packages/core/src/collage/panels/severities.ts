/**
 * Horizontal severity bars — port of Java TestResultSeveritiesPanel.
 */

import { createCanvas } from "@napi-rs/canvas";

import { STATUS_RGB, rgbCss, type ChartTheme, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  MARGIN,
  TITLE_HEIGHT,
  fillPill,
  horizontalBarRowsLayout,
} from "./bars.js";

const CANON_ORDER = [
  "blocker",
  "critical",
  "normal",
  "minor",
  "trivial",
] as const;

const BLOCKER: Rgb = { r: 0xc0, g: 0x39, b: 0x2b };
const NORMAL: Rgb = { r: 0xff, g: 0x8c, b: 0x42 };

/** Canonical order: blocker → … → trivial; other keys alphabetically. */
export function orderedSeverities(
  raw: Record<string, number> | null | undefined,
): Array<[string, number]> {
  const ordered: Array<[string, number]> = [];
  if (!raw || Object.keys(raw).length === 0) {
    return ordered;
  }
  for (const key of CANON_ORDER) {
    const count = raw[key];
    if (count != null && count > 0) {
      ordered.push([key, count]);
    }
  }
  const extras = Object.keys(raw)
    .filter((key) => !(CANON_ORDER as readonly string[]).includes(key))
    .sort();
  for (const key of extras) {
    const count = raw[key];
    if (count != null && count > 0) {
      ordered.push([key, count]);
    }
  }
  return ordered;
}

function severityColor(key: string, theme: ChartTheme): Rgb {
  const normalized = key.toLowerCase();
  switch (normalized) {
    case "blocker":
      return BLOCKER;
    case "critical":
      return STATUS_RGB.failed;
    case "normal":
      return NORMAL;
    case "minor":
      return STATUS_RGB.broken;
    case "trivial":
      return STATUS_RGB.skipped;
    default:
      return theme.accent;
  }
}

export function renderSeveritiesPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const ordered = orderedSeverities(analytics.severities);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Results by severity", MARGIN, MARGIN + 12);
  }

  if (ordered.length === 0) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No severity data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  let maxCount = 1;
  for (const [, count] of ordered) {
    maxCount = Math.max(maxCount, count);
  }

  const chartWidth = width - MARGIN * 2;
  const labelWidth = Math.min(100, Math.floor(chartWidth / 3));
  const barAreaWidth = chartWidth - labelWidth - 40;
  const layout = horizontalBarRowsLayout(height, showTitle, ordered.length);
  ctx.font = `${layout.fontSize}px sans-serif`;
  const ascent = layout.fontSize * 0.8;
  const descent = layout.fontSize * 0.2;

  ordered.forEach(([key, count], index) => {
    const baseline = layout.textBaseline(index, ascent, descent);
    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(key, MARGIN, baseline);

    const barWidth = Math.floor((count / maxCount) * barAreaWidth);
    const barX = MARGIN + labelWidth;
    ctx.fillStyle = rgbCss(severityColor(key, theme));
    fillPill(ctx, barX, layout.barTop(index), Math.max(barWidth, 2), layout.barHeight);

    ctx.fillStyle = rgbCss(theme.text);
    ctx.fillText(String(count), barX + barWidth + 6, baseline);
  });

  return canvas.toBuffer("image/png");
}
