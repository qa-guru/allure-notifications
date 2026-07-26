/**
 * Stacked status bars over history runs — port of Java StatusDynamicsPanel.
 */

import { createCanvas } from "@napi-rs/canvas";

import {
  STATUS_KEYS,
  isHistoryEmpty,
} from "../../report/history.js";
import { STATUS_RGB, rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  DEFAULT_ARC,
  MARGIN,
  TITLE_HEIGHT,
  chartHeight,
  chartTop,
  fillStackedVertical,
  stackedSegmentHeights,
} from "./bars.js";

function statusColor(status: string) {
  switch (status) {
    case "passed":
      return STATUS_RGB.passed;
    case "failed":
      return STATUS_RGB.failed;
    case "broken":
      return STATUS_RGB.broken;
    case "skipped":
      return STATUS_RGB.skipped;
    default:
      return STATUS_RGB.unknown;
  }
}

export function renderStatusDynamicsPanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics, showTitle } = context;
  const history = analytics.history;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Status dynamics", MARGIN, MARGIN + 12);
  }

  if (isHistoryEmpty(history)) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "12px sans-serif";
    ctx.fillText("No history data", MARGIN, MARGIN + TITLE_HEIGHT + 16);
    return canvas.toBuffer("image/png");
  }

  const dynamics = history!.statusDynamics;
  const runs = dynamics.length;
  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const chartWidth = width - MARGIN * 2;
  const slot = Math.max(1, Math.floor(chartWidth / runs));
  const barWidth = Math.max(1, Math.min(slot - 4, slot));

  for (let i = 0; i < runs; i++) {
    const counts = dynamics[i]!;
    let runTotal = 0;
    for (const status of STATUS_KEYS) {
      runTotal += counts[status] ?? 0;
    }
    if (runTotal <= 0) continue;

    const x = MARGIN + i * slot + Math.floor((slot - barWidth) / 2);
    let yCursor = top + plotH;
    const visible: string[] = [];
    const values: number[] = [];
    for (const status of STATUS_KEYS) {
      const value = counts[status] ?? 0;
      if (value > 0) {
        visible.push(status);
        values.push(value);
      }
    }
    const segmentHeights = stackedSegmentHeights(plotH, values);
    for (let si = 0; si < visible.length; si++) {
      const status = visible[si]!;
      const segmentHeight = segmentHeights[si] ?? 0;
      yCursor -= segmentHeight;
      const roundBottom = si === 0;
      const roundTop = si === visible.length - 1;
      ctx.fillStyle = rgbCss(statusColor(status));
      fillStackedVertical(
        ctx,
        x,
        yCursor,
        barWidth,
        segmentHeight,
        DEFAULT_ARC,
        roundTop,
        roundBottom,
      );
    }
  }

  return canvas.toBuffer("image/png");
}
