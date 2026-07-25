/**
 * @allure-notifications/core — Allure 3 → native collage PNG.
 *
 * Phase 3 / Stage C. Production PNG via @napi-rs/canvas (not Playwright).
 */

export const PACKAGE = "@allure-notifications/core";
export const PHASE = 3;
/** Locked native PNG backend — see README. */
export const PNG_BACKEND = "@napi-rs/canvas" as const;

export type {
  AllureLabel,
  AllureTestResult,
  ReportAnalytics,
  Statistic,
  SuiteStat,
  Summary,
} from "./report/types.js";

export { adaptSummaryJson, readSummary } from "./report/summary.js";
export {
  durationMsOf,
  labelOf,
  layerOf,
  parseTestResult,
  readAllureResults,
  resolveResultsFolder,
  severityOf,
  suiteNameOf,
} from "./report/results.js";
export { buildAnalytics, loadReportAnalytics } from "./report/analytics.js";

export { renderCollagePng } from "./collage/render.js";
export {
  PYRAMID_GEOMETRY,
  layerBreakdownFrom,
} from "./collage/panels/pyramid.js";
export {
  STATUS_RGB,
  themeFromDarkMode,
  hexToRgb,
  rgbCss,
} from "./theme.js";
