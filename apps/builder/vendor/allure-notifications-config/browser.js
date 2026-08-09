/**
 * Browser-safe surface for apps/builder (no zod).
 * Synced into `apps/builder/vendor/allure-notifications-config/` — see builder `scripts/sync-config.mjs`.
 */
export { PHRASES, captionPhrasesFor, phrasesFor, resolvePhraseLanguage, } from "./phrases.js";
export { PANEL_CATALOG, PANEL_META, CHART_TYPES, resolvePanelMeta, } from "./catalog.js";
export { CHART_PROFILE_DEFAULT, KIT_ONLY_PANEL_KIND, KIT_ONLY_PANEL_IDS, KIT_ONLY_PANEL_KINDS, KIT_ONLY_PANEL_ID_SET, normalizeChartProfile, isKitOnlyPanelType, isKitOnlyPanelId, isKitOnlyChartItem, shouldSilentSkipKitOnlyItem, } from "./kit-only.js";
export { CANVAS_PRESETS, DEFAULT_CANVAS, GRID_COLS, GRID_ROWS, DEFAULT_HEADER_HEIGHT, DEFAULT_CARD_GAP, DEFAULT_TILE_PAD, DEFAULT_ITEMS, createDefaultConfig, createSq1080Config, } from "./presets.js";
