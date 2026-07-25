/**
 * Browser-safe surface for apps/builder (no zod).
 * Synced into `apps/builder/vendor/allure-notifications-config/` — see builder `scripts/sync-config.mjs`.
 */

export {
  PANEL_CATALOG,
  PANEL_META,
  CHART_TYPES,
  resolvePanelMeta,
  type PanelMeta,
  type ChartItem,
} from "./catalog.js";

export {
  CANVAS_PRESETS,
  DEFAULT_CANVAS,
  GRID_COLS,
  GRID_ROWS,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_CARD_GAP,
  DEFAULT_TILE_PAD,
  DEFAULT_ITEMS,
  createDefaultConfig,
  createSq1080Config,
  type CanvasSize,
  type DefaultConfigOptions,
} from "./presets.js";
