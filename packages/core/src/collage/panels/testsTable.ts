/**
 * Kit tests-table panel → @napi-rs/canvas PNG (collage profile=kit).
 *
 * Columns: name | status | trend (sparkline) | stability (dots + flaky badge).
 * Canvas paint only — no HTML screenshot.
 */

import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import type {
  KitTestsTableData,
  KitTestsTableHistoryPoint,
  KitTestsTableRow,
} from "@qa-guru/allure-report-kit";

import {
  KIT_LIGHT_TOKEN_PALETTE,
  hexToRgb,
  mixRgb,
  resolveKitPalette,
  rgbCss,
  type Rgb,
} from "../../theme.js";

/** Kit `theme/kit.css` light defaults — resolve for canvas. */
export const TESTS_TABLE_TOKEN_PALETTE: Readonly<Record<string, Rgb>> =
  KIT_LIGHT_TOKEN_PALETTE;

const DEFAULT_COLUMNS = {
  ru: ["Тест", "Статус", "Тренд", "Стабильность"],
  en: ["Test", "Status", "Trend", "Stability"],
} as const;

const DEFAULT_EMPTY_ROWS = {
  ru: "Нет тестов в прогоне.",
  en: "No tests in this run.",
} as const;

const STATUS_LABELS = {
  ru: {
    passed: "ПРОЙДЕН",
    failed: "УПАЛ",
    broken: "СЛОМАН",
    skipped: "ПРОПУЩЕН",
    unknown: "НЕИЗВЕСТЕН",
  },
  en: {
    passed: "PASSED",
    failed: "FAILED",
    broken: "BROKEN",
    skipped: "SKIPPED",
    unknown: "UNKNOWN",
  },
} as const;

const SPARKLINE_EMPTY = {
  ru: "Нет истории",
  en: "No history",
} as const;

const PNG_MAGIC = "89504e470d0a1a0a";

export type RenderTestsTablePngOptions = {
  width: number;
  height: number;
  /** Override kit token palette (tests). */
  palette?: Readonly<Record<string, Rgb>>;
  /** Dark collage theme — sparkline accent palette. */
  dark?: boolean;
};

type SparklineTheme = {
  accent: Rgb;
  pass: Rgb;
  fail: Rgb;
  broken: Rgb;
  skip: Rgb;
};

function lookupToken(ref: string, palette: Record<string, Rgb>): Rgb {
  return palette[ref] ?? TESTS_TABLE_TOKEN_PALETTE[ref] ?? hexToRgb("#000000");
}

function sparklineTheme(dark: boolean, palette: Record<string, Rgb>): SparklineTheme {
  if (dark) {
    return {
      accent: hexToRgb("#38bdf8"),
      pass: hexToRgb("#4ade80"),
      fail: hexToRgb("#f87171"),
      broken: hexToRgb("#fbbf24"),
      skip: hexToRgb("#94a3b8"),
    };
  }
  return {
    accent: lookupToken("--color-primary", palette),
    pass: lookupToken("--color-success", palette),
    fail: lookupToken("--color-danger", palette),
    broken: lookupToken("--color-warning", palette),
    skip: lookupToken("--color-text-muted", palette),
  };
}

function statusSparkColor(status: string | undefined, theme: SparklineTheme): Rgb {
  const normalized = (status || "unknown").toLowerCase();
  if (normalized === "passed") return theme.pass;
  if (normalized === "failed") return theme.fail;
  if (normalized === "broken") return theme.broken;
  return theme.skip;
}

/** Trend stroke — passed keeps accent; other statuses use status-family colors. */
function trendSparkColor(status: string | undefined, theme: SparklineTheme): Rgb {
  const normalized = (status || "unknown").toLowerCase();
  if (normalized === "failed") return theme.fail;
  if (normalized === "broken") return theme.broken;
  if (normalized === "skipped" || normalized === "unknown") return theme.skip;
  return theme.accent;
}

function statusLabel(status: string, lang: "ru" | "en"): string {
  const normalized = (status || "unknown").toLowerCase();
  const table = STATUS_LABELS[lang];
  return table[normalized as keyof typeof table] ?? table.unknown;
}

function statusBadgeColors(
  status: string,
  palette: Record<string, Rgb>,
): { bg: Rgb; fg: Rgb } {
  const normalized = (status || "unknown").toLowerCase();
  const surface = lookupToken("--color-surface", palette);
  if (normalized === "passed") {
    const fg = lookupToken("--color-success", palette);
    return { bg: mixRgb(fg, surface, 0.22), fg };
  }
  if (normalized === "failed") {
    const fg = lookupToken("--color-danger", palette);
    return { bg: mixRgb(fg, surface, 0.22), fg };
  }
  if (normalized === "broken") {
    const fg = lookupToken("--color-warning", palette);
    return { bg: mixRgb(fg, surface, 0.22), fg };
  }
  const fg = lookupToken("--color-text-muted", palette);
  return { bg: mixRgb(fg, surface, 0.18), fg };
}

function ellipsize(ctx: SKRSContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${text.slice(0, mid)}${ellipsis}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo <= 0 ? ellipsis : `${text.slice(0, lo)}${ellipsis}`;
}

function roundRectPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function paintSparkline(
  ctx: SKRSContext2D,
  history: KitTestsTableHistoryPoint[] | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: SparklineTheme,
  lang: "ru" | "en",
  palette: Record<string, Rgb>,
  stroke: Rgb = theme.accent,
): void {
  const points = (history ?? []).filter((point) => typeof point.durationSec === "number");
  if (points.length < 2) {
    ctx.fillStyle = rgbCss(lookupToken("--color-text-muted", palette));
    ctx.font = "11px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(SPARKLINE_EMPTY[lang], x, y + h / 2);
    return;
  }

  const values = points.map((point) => point.durationSec as number);
  /* Fill the trend column — do not leave an intrinsic 88px island. */
  const width = Math.max(1, w);
  const height = Math.min(28, h);
  const padX = 0;
  const padY = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords: Array<{ x: number; y: number }> = values.map((value, index) => ({
    x: padX + (index / (values.length - 1)) * (width - padX * 2),
    y: padY + (1 - (value - min) / range) * (height - padY * 2),
  }));

  const ox = x;
  const oy = y + (h - height) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ox + padX, oy + height - padY);
  for (const point of coords) {
    ctx.lineTo(ox + point.x, oy + point.y);
  }
  ctx.lineTo(ox + width - padX, oy + height - padY);
  ctx.closePath();
  ctx.fillStyle = `rgba(${stroke.r},${stroke.g},${stroke.b},0.14)`;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(ox + coords[0]!.x, oy + coords[0]!.y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(ox + coords[i]!.x, oy + coords[i]!.y);
  }
  ctx.strokeStyle = rgbCss(stroke);
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function paintStabilityCell(
  ctx: SKRSContext2D,
  row: KitTestsTableRow,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: SparklineTheme,
  palette: Record<string, Rgb>,
): void {
  const flips = row.flakyFlips ?? 0;
  const runs = (row.history ?? []).slice(-10);
  let cursor = x;
  const midY = y + h / 2;

  if (flips > 0) {
    const badgeW = Math.max(20, 8 + String(flips).length * 7);
    const badgeH = 16;
    const warning = lookupToken("--color-warning", palette);
    const surface = lookupToken("--color-surface", palette);
    roundRectPath(ctx, cursor, midY - badgeH / 2, badgeW, badgeH, 4);
    ctx.fillStyle = rgbCss(mixRgb(warning, surface, 0.24));
    ctx.fill();
    ctx.fillStyle = rgbCss(warning);
    ctx.font = "600 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(flips), cursor + badgeW / 2, midY);
    cursor += badgeW + 6;
  }

  if (!runs.length) {
    ctx.fillStyle = rgbCss(lookupToken("--color-text-muted", palette));
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("—", cursor, midY);
    return;
  }

  const dotSize = 7;
  const gap = 3;
  for (const point of runs) {
    if (cursor + dotSize > x + w) {
      break;
    }
    const color = statusSparkColor(point.status, theme);
    ctx.fillStyle = rgbCss(color);
    ctx.beginPath();
    ctx.arc(cursor + dotSize / 2, midY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
    cursor += dotSize + gap;
  }
}

function paintStatusBadge(
  ctx: SKRSContext2D,
  status: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: Record<string, Rgb>,
): void {
  const { bg, fg } = statusBadgeColors(status, palette);
  const padX = 6;
  ctx.font = "600 10px sans-serif";
  const textW = ctx.measureText(label).width;
  const badgeW = Math.min(w, textW + padX * 2);
  const badgeH = 18;
  const bx = x;
  const by = y + (h - badgeH) / 2;
  roundRectPath(ctx, bx, by, badgeW, badgeH, 4);
  ctx.fillStyle = rgbCss(bg);
  ctx.fill();
  ctx.fillStyle = rgbCss(fg);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, bx + badgeW / 2, by + badgeH / 2);
}

/**
 * Render tests-table panel PNG from kit {@link KitTestsTableData}.
 */
export function renderTestsTablePng(
  data: KitTestsTableData,
  options: RenderTestsTablePngOptions,
): Buffer {
  const width = Math.max(1, Math.floor(options.width));
  const height = Math.max(1, Math.floor(options.height));
  const palette = resolveKitPalette(options.dark, options.palette);
  const surface = lookupToken("--color-surface", palette);
  const text = lookupToken("--color-text", palette);
  const muted = lookupToken("--color-text-muted", palette);
  const border = lookupToken("--color-border", palette);
  const lang = data.lang ?? "ru";
  const columns = data.columns ?? [...DEFAULT_COLUMNS[lang]];
  const rows = data.rows ?? [];
  const sparkTheme = sparklineTheme(options.dark ?? false, palette);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = rgbCss(surface);
  ctx.fillRect(0, 0, width, height);

  if (!rows.length) {
    ctx.fillStyle = rgbCss(muted);
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      data.emptyRowsLabel?.[lang] ?? DEFAULT_EMPTY_ROWS[lang],
      width / 2,
      height / 2,
    );
    return canvas.toBuffer("image/png");
  }

  const padX = 8;
  const headerH = 28;
  const rowH = 32;
  const statusW = Math.min(88, Math.floor(width * 0.22));
  const trendW = Math.min(96, Math.floor(width * 0.24));
  const stabilityW = Math.min(88, Math.floor(width * 0.22));
  const nameW = Math.max(40, width - statusW - trendW - stabilityW - padX * 2);

  const colX = {
    name: padX,
    status: padX + nameW,
    trend: padX + nameW + statusW,
    stability: padX + nameW + statusW + trendW,
  };

  // Header
  ctx.fillStyle = rgbCss(muted);
  ctx.font = "600 11px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const headerY = headerH / 2;
  const headers = [columns[0] ?? "", columns[1] ?? "", columns[2] ?? "", columns[3] ?? ""];
  ctx.fillText(headers[0]!, colX.name, headerY);
  ctx.fillText(headers[1]!, colX.status, headerY);
  ctx.fillText(headers[2]!, colX.trend, headerY);
  ctx.fillText(headers[3]!, colX.stability, headerY);

  ctx.strokeStyle = rgbCss(border);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, headerH + 0.5);
  ctx.lineTo(width, headerH + 0.5);
  ctx.stroke();

  const bodyTop = headerH;
  const maxRows = Math.max(1, Math.floor((height - bodyTop) / rowH));
  const visibleRows = rows.slice(0, maxRows);

  visibleRows.forEach((row, index) => {
    const y = bodyTop + index * rowH;
    if (index > 0) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = rgbCss(text);
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const displayName = row.name || row.fullName || "—";
    ctx.fillText(
      ellipsize(ctx, displayName, nameW - 4),
      colX.name,
      y + rowH / 2,
    );

    paintStatusBadge(
      ctx,
      row.status,
      statusLabel(row.status, lang),
      colX.status,
      y,
      statusW,
      rowH,
      palette,
    );

    paintSparkline(
      ctx,
      row.history,
      colX.trend,
      y,
      trendW,
      rowH,
      sparkTheme,
      lang,
      palette,
      trendSparkColor(row.status, sparkTheme),
    );

    paintStabilityCell(ctx, row, colX.stability, y, stabilityW, rowH, sparkTheme, palette);
  });

  const png = canvas.toBuffer("image/png");
  if (png.subarray(0, 8).toString("hex") !== PNG_MAGIC) {
    throw new Error("renderTestsTablePng: expected PNG buffer");
  }
  return png;
}
