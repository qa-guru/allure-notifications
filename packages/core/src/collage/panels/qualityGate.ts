/**
 * Kit quality-gate layout IR → @napi-rs/canvas PNG (T4 collage Profile path).
 *
 * Consumes kit contract/IR only — no duplicated layout metrics/tokens.
 * Collage/TG: `chrome: "body"` under macOS `drawCard` / `widget-tile__bar`.
 * Standalone/tests: `chrome: "hybrid"` paints quality-gate__bar + body.
 */

import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import {
  buildQualityGateLayout,
  parseKitQualityGateData,
  type KitQualityGateData,
  type QualityGateColorMix,
  type QualityGateLayout,
  type QualityGatePaintColor,
  type QualityGateTokenRef,
} from "@qa-guru/allure-report-kit";

import { hexToRgb, mixRgb, rgbCss, type Rgb } from "../../theme.js";

/** Kit `theme/kit.css` chrome defaults — resolve IR token refs for canvas. */
export const QUALITY_GATE_TOKEN_PALETTE: Readonly<Record<string, Rgb>> = {
  "--color-surface": hexToRgb("#ffffff"),
  "--color-surface-soft": hexToRgb("#f2f2f2"),
  "--color-text": hexToRgb("#1c1917"),
  "--color-text-muted": { r: 28, g: 25, b: 23 }, // 55% opacity applied at paint
  "--color-border": { r: 127, g: 127, b: 127 }, // 22% opacity applied at paint
  "--color-success": hexToRgb("#49cb68"),
  "--color-danger": hexToRgb("#fd5a3e"),
  "--color-status-passed-chart": hexToRgb("#49cb68"),
};

const TOKEN_ALPHA: Readonly<Record<string, number>> = {
  "--color-text-muted": 0.55,
  "--color-border": 0.22,
};

const DEFAULT_REM = 16;
const PNG_MAGIC = "89504e470d0a1a0a";

export type RenderQualityGatePngOptions = {
  width: number;
  height: number;
  /** CSS rem root used for layout metrics (default 16). */
  rem?: number;
  /** Override kit token palette (tests). */
  palette?: Readonly<Record<string, Rgb>>;
  /**
   * `hybrid` — own bar+body (standalone / tests).
   * `body` — body only under collage macOS `drawCard` / TG `widget-tile__bar` (default for jar).
   */
  chrome?: "hybrid" | "body";
};

function isQualityGateLayout(value: unknown): value is QualityGateLayout {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.metrics === "object" &&
    v.metrics !== null &&
    typeof v.tokens === "object" &&
    v.tokens !== null &&
    typeof v.bar === "object" &&
    v.bar !== null &&
    typeof v.body === "object" &&
    v.body !== null
  );
}

function resolveLayout(
  dataOrLayout: KitQualityGateData | QualityGateLayout | unknown,
): QualityGateLayout {
  if (isQualityGateLayout(dataOrLayout)) {
    return dataOrLayout;
  }
  return buildQualityGateLayout(parseKitQualityGateData(dataOrLayout));
}

function lookupToken(ref: QualityGateTokenRef | string, palette: Record<string, Rgb>): Rgb {
  return palette[ref] ?? QUALITY_GATE_TOKEN_PALETTE[ref] ?? hexToRgb("#000000");
}

function resolveColorMix(
  mix: QualityGateColorMix,
  palette: Record<string, Rgb>,
  surface: Rgb,
): Rgb {
  const base = lookupToken(mix.base, palette);
  const weight = Math.min(1, Math.max(0, mix.percent / 100));
  if (mix.with === "transparent") {
    // CSS color-mix(…, transparent) over surface ≈ weighted mix with surface.
    return mixRgb(base, surface, weight);
  }
  return mixRgb(base, lookupToken(mix.with, palette), weight);
}

function cssColor(
  paint: QualityGatePaintColor,
  palette: Record<string, Rgb>,
  surface: Rgb,
): string {
  if (typeof paint === "string") {
    const rgb = lookupToken(paint, palette);
    const alpha = TOKEN_ALPHA[paint];
    if (alpha !== undefined) {
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    }
    return rgbCss(rgb);
  }
  return rgbCss(resolveColorMix(paint, palette, surface));
}

function remPx(rem: number, root: number): number {
  return rem * root;
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

function wrapLines(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [];
  }
  const lines: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]!}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    lines.push(current);
    current = words[i]!;
    if (lines.length >= maxLines) {
      break;
    }
  }
  if (lines.length < maxLines) {
    lines.push(current);
  } else {
    const last = lines[lines.length - 1]!;
    lines[lines.length - 1] = ellipsize(ctx, last, maxWidth);
  }
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    lines[lines.length - 1] = ellipsize(ctx, lines[lines.length - 1]!, maxWidth);
  }
  return lines;
}

/**
 * Render one quality-gate panel PNG from kit data or prebuilt layout IR.
 *
 * Hidden layouts (empty rules) yield a transparent PNG of the requested size.
 */
export function renderQualityGatePng(
  dataOrLayout: KitQualityGateData | QualityGateLayout | unknown,
  options: RenderQualityGatePngOptions,
): Buffer {
  const width = Math.max(1, Math.floor(options.width));
  const height = Math.max(1, Math.floor(options.height));
  const rem = options.rem ?? DEFAULT_REM;
  const layout = resolveLayout(dataOrLayout);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (layout.hidden) {
    return canvas.toBuffer("image/png");
  }

  const palette: Record<string, Rgb> = {
    ...QUALITY_GATE_TOKEN_PALETTE,
    ...(options.palette ?? {}),
  };
  const { metrics, tokens } = layout;
  const surface = lookupToken(tokens.surface, palette);
  const status = layout.passed ? "passed" : "failed";
  const radius = metrics.borderRadiusMd;
  const chrome = options.chrome ?? "hybrid";
  const paintBar = chrome === "hybrid";

  // Root fill — under drawCard the parent clips; body chrome is a flat body tile.
  if (paintBar) {
    roundRectPath(ctx, 0, 0, width, height, radius);
    ctx.fillStyle = rgbCss(surface);
    ctx.fill();
    ctx.save();
    roundRectPath(ctx, 0, 0, width, height, radius);
    ctx.clip();

    roundRectPath(ctx, 0.5, 0.5, width - 1, height - 1, radius);
    ctx.strokeStyle = cssColor(tokens.rootBorder[status], palette, surface);
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.fillStyle = rgbCss(surface);
    ctx.fillRect(0, 0, width, height);
    ctx.save();
  }

  let bodyTop = 0;
  if (paintBar) {
    // quality-gate__bar (IR) — standalone hybrid only (not under macOS drawCard).
    const barH = metrics.barHeight;
    const barBg = cssColor(tokens.barBackground, palette, surface);
    ctx.fillStyle = barBg;
    ctx.fillRect(0, 0, width, barH);

    ctx.beginPath();
    ctx.moveTo(0, barH + 0.5);
    ctx.lineTo(width, barH + 0.5);
    ctx.strokeStyle = cssColor(tokens.barBorderBottom[status], palette, surface);
    ctx.lineWidth = 1;
    ctx.stroke();

    const inset = metrics.barInset;
    // Hybrid bar: title only — no status indicator, no info glyph.
    const titleSize = remPx(metrics.barTitleSizeRem, rem);
    ctx.font = `600 ${titleSize}px sans-serif`;
    ctx.fillStyle = cssColor(tokens.textMuted, palette, surface);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const titleMaxW = Math.max(24, width - 2 * inset - 4);
    const title = ellipsize(ctx, layout.bar.title, titleMaxW);
    ctx.fillText(title, inset, barH / 2);
    bodyTop = barH;
  }

  const bodyH = height - bodyTop;
  const bodyFont = remPx(metrics.bodyFontSizeRem, rem);

  if (layout.body.mode === "passed") {
    const pad = metrics.bodyPaddingPassed;
    const verdictSize = remPx(metrics.verdictFontSizeRem, rem);
    ctx.font = `600 ${verdictSize}px sans-serif`;
    ctx.fillStyle = rgbCss(lookupToken(tokens.verdictOk, palette));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = ellipsize(ctx, layout.body.verdict, Math.max(8, width - 2 * pad));
    ctx.fillText(label, width / 2, bodyTop + bodyH / 2);
  } else {
    paintFailedRules(ctx, layout, {
      x: 0,
      y: bodyTop,
      w: width,
      h: bodyH,
      rem,
      bodyFont,
      palette,
      surface,
    });
  }

  ctx.restore();
  const png = canvas.toBuffer("image/png");
  // Sanity for callers / tests — buffer is a PNG.
  if (png.subarray(0, 8).toString("hex") !== PNG_MAGIC) {
    throw new Error("renderQualityGatePng: expected PNG buffer");
  }
  return png;
}

function paintFailedRules(
  ctx: SKRSContext2D,
  layout: QualityGateLayout,
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
    rem: number;
    bodyFont: number;
    palette: Record<string, Rgb>;
    surface: Rgb;
  },
): void {
  if (layout.body.mode !== "failed") {
    return;
  }
  const { metrics, tokens } = layout;
  const rows = layout.body.rows;
  if (!rows.length || box.h <= 0) {
    return;
  }

  const idMin = remPx(metrics.ruleIdMinWidthRem, box.rem);
  const idMax = remPx(metrics.ruleGridIdMaxRem, box.rem);
  const idFont = box.bodyFont * metrics.ruleIdFontSizeEm;
  ctx.font = `600 ${idFont}px ui-monospace, "SF Mono", Menlo, monospace`;

  let idCol = idMin;
  for (const row of rows) {
    idCol = Math.max(idCol, Math.ceil(ctx.measureText(row.id).width + 2 * metrics.ruleIdPaddingX));
  }
  idCol = Math.min(idMax, Math.max(idMin, idCol));
  idCol = Math.min(idCol, Math.floor(box.w * 0.45));

  const detailX = box.x + idCol;
  const detailW = Math.max(0, box.w - idCol);
  const rowH = Math.max(
    metrics.ruleIdPaddingY * 2 + idFont * 1.25,
    Math.floor(box.h / rows.length),
  );

  let y = box.y;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (y >= box.y + box.h) {
      break;
    }
    const h = Math.min(rowH, box.y + box.h - y);

    // id cell
    ctx.fillStyle = cssColor(tokens.ruleId.background.failed, box.palette, box.surface);
    ctx.fillRect(box.x, y, idCol, h);
    ctx.fillStyle = rgbCss(lookupToken(tokens.ruleId.color.failed, box.palette));
    ctx.font = `600 ${idFont}px ui-monospace, "SF Mono", Menlo, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const idText = ellipsize(
      ctx,
      row.id,
      Math.max(4, idCol - 2 * metrics.ruleIdPaddingX),
    );
    ctx.fillText(idText, box.x + metrics.ruleIdPaddingX, y + h / 2);

    // detail cell
    ctx.fillStyle = rgbCss(box.surface);
    ctx.fillRect(detailX, y, detailW, h);

    const textX = detailX + metrics.ruleDetailPaddingX;
    const textMaxW = Math.max(4, detailW - 2 * metrics.ruleDetailPaddingX);
    ctx.font = `400 ${box.bodyFont}px sans-serif`;
    ctx.fillStyle = rgbCss(lookupToken(tokens.ruleMessage, box.palette));
    ctx.textBaseline = "top";
    const msgLines = wrapLines(ctx, row.message, textMaxW, row.formula ? 2 : 3);
    let ty = y + metrics.ruleDetailPaddingY;
    for (const line of msgLines) {
      ctx.fillText(line, textX, ty);
      ty += box.bodyFont * 1.35;
    }
    if (row.formula) {
      ty += metrics.formulaMarginTop;
      const formulaSize = box.bodyFont * 0.8;
      ctx.font = `500 ${formulaSize}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx.fillStyle = rgbCss(lookupToken(tokens.ruleFormula, box.palette));
      ctx.fillText(ellipsize(ctx, row.formula, textMaxW), textX, ty);
    }

    // borders
    ctx.beginPath();
    ctx.moveTo(detailX + 0.5, y);
    ctx.lineTo(detailX + 0.5, y + h);
    ctx.strokeStyle = cssColor(tokens.border, box.palette, box.surface);
    ctx.lineWidth = 1;
    ctx.stroke();

    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(box.x, y + 0.5);
      ctx.lineTo(box.x + box.w, y + 0.5);
      ctx.stroke();
    }

    y += h;
  }
}
