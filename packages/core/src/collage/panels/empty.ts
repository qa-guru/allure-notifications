/**
 * Empty-state panel for catalog stubs / unknown tiles.
 * Port of Java EmptyStatePanel — themed body, muted caption, font-independent marker.
 * Card chrome (header/title) is drawn by collage render; optional in-panel title when showTitle.
 */

import { createCanvas } from "@napi-rs/canvas";

import { rgbCss, type ChartTheme, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";

const MARGIN = 16;
const MARKER_MAX_W = 48;
const MARKER_H = 2;

/** Body placeholder — card header carries the catalog title. */
export const DEFAULT_EMPTY_MESSAGE = "No data yet";

export type EmptyPanelOptions = {
  message?: string;
  /** Drawn inside the body when `context.showTitle` is true. */
  title?: string;
};

function mutedText(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 150, g: 150, b: 150 }
    : { r: 138, g: 148, b: 166 };
}

function headlineText(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 236, g: 239, b: 244 }
    : { r: 46, g: 52, b: 64 };
}

function normalizeOpts(
  messageOrOpts?: string | EmptyPanelOptions,
): { message: string; title?: string } {
  if (messageOrOpts == null) {
    return { message: DEFAULT_EMPTY_MESSAGE };
  }
  if (typeof messageOrOpts === "string") {
    const message =
      messageOrOpts.trim().length > 0
        ? messageOrOpts
        : DEFAULT_EMPTY_MESSAGE;
    return { message };
  }
  const message =
    messageOrOpts.message && messageOrOpts.message.trim().length > 0
      ? messageOrOpts.message
      : DEFAULT_EMPTY_MESSAGE;
  const title =
    messageOrOpts.title && messageOrOpts.title.trim().length > 0
      ? messageOrOpts.title.trim()
      : undefined;
  return { message, title };
}

/**
 * Themed empty tile: card background, optional title, muted placeholder + marker bar.
 */
export function renderEmptyPanel(
  context: PanelContext,
  messageOrOpts: string | EmptyPanelOptions = DEFAULT_EMPTY_MESSAGE,
): Buffer {
  const { theme, showTitle } = context;
  const width = Math.max(1, context.width);
  const height = Math.max(1, context.height);
  const { message, title } = normalizeOpts(messageOrOpts);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);

  let centerY = height / 2;

  if (showTitle && title) {
    const titleSize = Math.max(12, Math.round(Math.min(width, height) * 0.06));
    ctx.font = `bold ${titleSize}px sans-serif`;
    ctx.fillStyle = rgbCss(headlineText(theme));
    const tw = ctx.measureText(title).width;
    const tx = Math.max(MARGIN, (width - tw) / 2);
    const ty = Math.max(MARGIN + titleSize, Math.round(height * 0.28));
    ctx.fillText(title, tx, ty);
    centerY = Math.min(height - MARGIN, ty + titleSize + Math.round(height * 0.12));
  }

  const captionSize = 12;
  ctx.font = `${captionSize}px sans-serif`;
  ctx.fillStyle = rgbCss(mutedText(theme));
  const textWidth = ctx.measureText(message).width;
  const textX = Math.max(MARGIN, (width - textWidth) / 2);
  const textY = Math.max(MARGIN + captionSize, Math.round(centerY));
  ctx.fillText(message, textX, textY);

  // Font-independent marker (Java EmptyStatePanel) — stable for pixel tests / headless.
  const barW = Math.min(MARKER_MAX_W, Math.max(1, width - 2 * MARGIN));
  const barX = Math.max(0, Math.floor((width - barW) / 2));
  const barY = Math.min(
    height - MARKER_H - 1,
    Math.max(MARGIN, textY + 8),
  );
  ctx.fillStyle = rgbCss(mutedText(theme));
  ctx.fillRect(barX, barY, barW, MARKER_H);

  return canvas.toBuffer("image/png");
}
