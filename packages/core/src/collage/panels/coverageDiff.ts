/**
 * Coverage diff map — treemap of suite/feature cells (added/removed/unchanged).
 * Data: last two history.jsonl runs (case-id set + labels).
 */

import { type CoverageDiffCell } from "../../report/history.js";
import { STATUS_RGB, rgbCss, type Rgb } from "../../theme.js";
import type { PanelContext } from "../context.js";
import { MARGIN, chartHeight, chartTop } from "./bars.js";
import { openHistoryPanel, paintPanelMessage } from "./panelFrame.js";

const ADDED: Rgb = { r: 0x6b, g: 0xbf, b: 0x59 };
const REMOVED = STATUS_RGB.failed;
const UNCHANGED_DARK: Rgb = { r: 80, g: 80, b: 80 };
const UNCHANGED_LIGHT: Rgb = { r: 210, g: 214, b: 220 };

function cellColor(kind: CoverageDiffCell["kind"], dark: boolean): Rgb {
  if (kind === "added") return ADDED;
  if (kind === "removed") return REMOVED;
  return dark ? UNCHANGED_DARK : UNCHANGED_LIGHT;
}

/** Simple row-slice treemap (stable, no external layout lib). */
function layoutTreemap(
  cells: CoverageDiffCell[],
  x: number,
  y: number,
  w: number,
  h: number,
): Array<CoverageDiffCell & { x: number; y: number; w: number; h: number }> {
  const total = cells.reduce((s, c) => s + c.count, 0) || 1;
  const out: Array<CoverageDiffCell & { x: number; y: number; w: number; h: number }> =
    [];
  if (cells.length === 0 || w <= 0 || h <= 0) return out;

  // Slice into rows of ~sqrt(n) items by weight.
  const n = cells.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  let i = 0;
  let yCursor = y;
  const rowCount = Math.ceil(n / cols);
  const rowH = h / rowCount;
  while (i < n) {
    const row = cells.slice(i, i + cols);
    const rowWeight = row.reduce((s, c) => s + c.count, 0) || 1;
    let xCursor = x;
    for (const cell of row) {
      const cellW = Math.max(4, (cell.count / rowWeight) * w);
      out.push({
        ...cell,
        x: xCursor,
        y: yCursor,
        w: Math.min(cellW, x + w - xCursor),
        h: rowH - 2,
      });
      xCursor += cellW;
    }
    // Normalize last row width leftover — stretch last cell.
    if (out.length > 0 && xCursor < x + w) {
      const last = out[out.length - 1]!;
      last.w += x + w - xCursor;
    }
    yCursor += rowH;
    i += cols;
  }
  return out;
}

export function renderCoverageDiffPanel(context: PanelContext): Buffer {
  const opened = openHistoryPanel(context, "Coverage diff");
  if (opened.empty) return opened.png;
  const { canvas, ctx, history, width, height, showTitle, theme } = opened;

  const cells = history.coverageDiff;
  if (cells.length === 0) {
    return paintPanelMessage(ctx, theme, canvas, "No coverage data");
  }

  const top = chartTop(showTitle);
  const plotH = chartHeight(height, showTitle);
  const gap = 3;
  const laid = layoutTreemap(
    cells,
    MARGIN,
    top,
    width - MARGIN * 2,
    plotH,
  );

  for (const cell of laid) {
    const x = cell.x + gap / 2;
    const y = cell.y + gap / 2;
    const w = Math.max(2, cell.w - gap);
    const h = Math.max(2, cell.h - gap);
    ctx.fillStyle = rgbCss(cellColor(cell.kind, theme.dark));
    const r = Math.min(6, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();

    if (w > 48 && h > 28) {
      ctx.fillStyle = "rgba(0,0,0,0.72)";
      ctx.font = "bold 11px sans-serif";
      const label =
        cell.name.length > 14 ? `${cell.name.slice(0, 13)}…` : cell.name;
      const tw = ctx.measureText(label).width;
      ctx.fillText(label, x + (w - tw) / 2, y + h / 2 - 2);
      if (h > 40) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        const kind = cell.kind;
        const kw = ctx.measureText(kind).width;
        ctx.fillText(kind, x + (w - kw) / 2, y + h / 2 + 12);
      }
    }
  }

  return canvas.toBuffer("image/png");
}
