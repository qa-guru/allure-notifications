/**
 * Shared panel frame — collapses createCanvas / title / empty-history preamble
 * that Sonar CPD flags across history panels.
 */

import { createCanvas, type Canvas, type SKRSContext2D } from "@napi-rs/canvas";

import {
  isHistoryEmpty,
  type HistoryAnalytics,
} from "../../report/history.js";
import { rgbCss, type ChartTheme } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { MARGIN, TITLE_HEIGHT } from "./bars.js";

export type OpenHistoryPanel =
  | { empty: true; png: Buffer }
  | {
      empty: false;
      canvas: Canvas;
      ctx: SKRSContext2D;
      history: HistoryAnalytics;
      width: number;
      height: number;
      showTitle: boolean;
      theme: ChartTheme;
    };

export function openHistoryPanel(
  context: PanelContext,
  title: string,
  emptyMessage = "No history data",
): OpenHistoryPanel {
  const { width, height, theme, analytics, showTitle } = context;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  if (showTitle) {
    ctx.fillStyle = rgbCss(theme.text);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(title, MARGIN, MARGIN + 12);
  }

  const history = analytics.history;
  if (isHistoryEmpty(history)) {
    return {
      empty: true,
      png: paintPanelMessage(ctx, theme, canvas, emptyMessage),
    };
  }

  return {
    empty: false,
    canvas,
    ctx,
    history: history!,
    width,
    height,
    showTitle,
    theme,
  };
}

export function paintPanelMessage(
  ctx: SKRSContext2D,
  theme: ChartTheme,
  canvas: Canvas,
  message: string,
): Buffer {
  ctx.fillStyle = rgbCss(theme.text);
  ctx.font = "12px sans-serif";
  ctx.fillText(message, MARGIN, MARGIN + TITLE_HEIGHT + 16);
  return canvas.toBuffer("image/png");
}
