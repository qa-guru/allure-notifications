/**
 * Empty-state panel for catalog stubs / unknown tiles.
 */

import { createCanvas } from "@napi-rs/canvas";

import { rgbCss } from "../../theme.js";
import type { PanelContext } from "../context.js";

export function renderEmptyPanel(
  context: PanelContext,
  message = "No data",
): Buffer {
  const { width, height, theme } = context;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = rgbCss(theme.text);
  ctx.font = "12px sans-serif";
  const tw = ctx.measureText(message).width;
  ctx.fillText(message, (width - tw) / 2, height / 2);
  return canvas.toBuffer("image/png");
}
