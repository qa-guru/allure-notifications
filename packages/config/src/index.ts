/**
 * @allure-notifications/config — shared config schema + builder catalog / presets.
 *
 * Phase 1 SSOT for `config.json` (SQ-1080 free + chrome knobs).
 * Browser runtime (no zod): `./browser` — synced into apps/builder vendor (Phase 4).
 */

export const PACKAGE = "@allure-notifications/config";
export const PHASE = 1;

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

export {
  ChartItemSchema,
  PanelsSchema,
  ChartConfigSchema,
  BaseSchema,
  TelegramSchema,
  ConfigSchema,
  parseConfig,
  safeParseConfig,
  isValidConfig,
  type ChartItemInput,
  type ChartConfigInput,
  type ConfigInput,
  type Config,
} from "./schema.js";
