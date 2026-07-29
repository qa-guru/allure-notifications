/**
 * Success-rate histogram (0–10% … 90–100%) — port of Java SuccessRateDistributionPanel.
 */

import { STATUS_RGB, rgbCss, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";
import {
  DEFAULT_ARC,
  MARGIN,
  chartHeight,
  chartTop,
  fillTopRounded,
} from "./bars.js";
import { openHistoryPanel } from "./panelFrame.js";

/** Linear red→green: bucket 0 (low success) red, last bucket green. */
function bucketColor(index: number, bins: number): Rgb {
  const t = bins <= 1 ? 1 : index / (bins - 1);
  const low = STATUS_RGB.failed;
  const high = STATUS_RGB.passed;
  return {
    r: Math.round(low.r + t * (high.r - low.r)),
    g: Math.round(low.g + t * (high.g - low.g)),
    b: Math.round(low.b + t * (high.b - low.b)),
  };
}

export function renderSuccessRateDistributionPanel(
  context: PanelContext,
): Buffer {
  const opened = openHistoryPanel(context, "Success rate distribution");
  if (opened.empty) return opened.png;
  const { canvas, ctx, history, width, height, showTitle } = opened;

  const buckets = history.successRateDistribution;
  const bins = buckets.length;
  const active: number[] = [];
  let maxCount = 1;
  for (let i = 0; i < bins; i++) {
    const count = buckets[i] ?? 0;
    if (count > 0) {
      active.push(i);
      maxCount = Math.max(maxCount, count);
    }
  }
  if (active.length === 0) {
    return canvas.toBuffer("image/png");
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const chartWidth = width - MARGIN * 2;
  const activeCount = active.length;
  const slot = Math.max(1, Math.floor(chartWidth / activeCount));
  const barWidth = Math.max(1, Math.min(slot - 2, slot));
  const arc = Math.min(DEFAULT_ARC, Math.max(2, Math.floor(barWidth / 2)));

  for (let j = 0; j < activeCount; j++) {
    const bucketIndex = active[j]!;
    const count = buckets[bucketIndex]!;
    const barHeight = Math.max(1, Math.round((count / maxCount) * plotH));
    const x = MARGIN + j * slot + Math.floor((slot - barWidth) / 2);
    const y = top + plotH - barHeight;
    ctx.fillStyle = rgbCss(bucketColor(bucketIndex, bins));
    fillTopRounded(ctx, x, y, barWidth, barHeight, arc);
  }

  return canvas.toBuffer("image/png");
}
