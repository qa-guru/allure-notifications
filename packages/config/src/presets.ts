/**
 * Canvas presets + DEFAULT_ITEMS (4-tile compact-hero) + chrome knobs.
 * Extracted from allure-notifications-builder `js/app.js` / CANON.md.
 */

import type { ChartItem } from "./catalog.js";
import { CHART_PROFILE_DEFAULT } from "./kit-only.js";

export type CanvasSize = { w: number; h: number };

/** Presets only — 870×1080 · 1080×1080 · 1410×1080 (no 1024×1280). */
export const CANVAS_PRESETS: Readonly<Record<string, CanvasSize>> = Object.freeze({
  "870x1080": { w: 870, h: 1080 },
  "1080x1080": { w: 1080, h: 1080 },
  "1410x1080": { w: 1410, h: 1080 },
});

/** Default canvas — CB-870 (Telegram post). */
export const DEFAULT_CANVAS = "870x1080" as const;

export const GRID_COLS = 10;
export const GRID_ROWS = 10;

/** Jar / collage chrome defaults (CollageRenderer + widget-tile canon in builder). */
export const DEFAULT_HEADER_HEIGHT = 31;
export const DEFAULT_CARD_GAP = 14;
/** Inner body pad (px) — jar collage + builder `--wt-pad`. */
export const DEFAULT_TILE_PAD = 6;

/**
 * Default layout — 4-tile on full 10×10 substrate.
 * currentStatus 4×4 · durationDynamics 6×4 · pyramid 3×3 | durations-by-layer 4×3 · empty cols 7–9 + rows 7–9.
 * See builder CANON.md.
 */
export const DEFAULT_ITEMS: ReadonlyArray<ChartItem> = Object.freeze([
  { type: "currentStatus", x: 0, y: 0, w: 4, h: 4 },
  { type: "durationDynamics", x: 4, y: 0, w: 6, h: 4 },
  { type: "testingPyramid", x: 0, y: 4, w: 3, h: 3 },
  { type: "durations", x: 3, y: 4, w: 4, h: 3, groupBy: "layer" },
]);

export type DefaultConfigOptions = {
  project?: string;
  environment?: string;
  comment?: string;
  language?: string;
  allureFolder?: string;
  allureResultsFolder?: string;
  canvas?: keyof typeof CANVAS_PRESETS;
  telegram?: {
    token?: string;
    chat?: string;
    topic?: string;
    replyTo?: string;
    templatePath?: string;
  };
};

/**
 * Builder-shaped default `config.json` (CB-870 free + chrome knobs).
 * Matches `createDefaultState()` export from the builder (minus UI-only `vector`).
 */
export function createDefaultConfig(opts: DefaultConfigOptions = {}) {
  const canvasKey = opts.canvas ?? DEFAULT_CANVAS;
  const canvas = CANVAS_PRESETS[canvasKey];
  if (!canvas) {
    throw new Error(`Unknown canvas preset: ${String(canvasKey)}`);
  }

  return {
    base: {
      project: opts.project ?? "",
      environment: opts.environment ?? "",
      comment: opts.comment ?? "",
      language: opts.language ?? "en",
      allureFolder: opts.allureFolder ?? "allure-report/",
      allureResultsFolder: opts.allureResultsFolder ?? "allure-results/",
      enableChart: true,
      darkMode: true,
      chart: {
        profile: CHART_PROFILE_DEFAULT,
        mode: "collage" as const,
        layout: "free" as const,
        width: canvas.w,
        height: canvas.h,
        headerHeight: DEFAULT_HEADER_HEIGHT,
        cardGap: DEFAULT_CARD_GAP,
        tilePad: DEFAULT_TILE_PAD,
        gridCols: GRID_COLS,
        gridRows: GRID_ROWS,
        items: DEFAULT_ITEMS.map((p) => ({ ...p })),
        pyramidFallback: "suites",
      },
      links: {
        report: "",
        dashboard: "",
        testops: "",
        build: "",
      },
    },
    telegram: {
      token: opts.telegram?.token ?? "",
      chat: opts.telegram?.chat ?? "",
      topic: opts.telegram?.topic ?? "",
      replyTo: opts.telegram?.replyTo ?? "",
      templatePath: opts.telegram?.templatePath ?? "/templates/telegram.ftl",
    },
  };
}

/** SQ-1080 helper — same DEFAULT_ITEMS on 1080×1080. */
export function createSq1080Config(opts: DefaultConfigOptions = {}) {
  return createDefaultConfig({ ...opts, canvas: "1080x1080" });
}
