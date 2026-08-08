/**
 * @qa-guru/allure-notifications-core — Allure 3 → native collage PNG.
 *
 * Phase 3 / Stage C. Production PNG via @napi-rs/canvas (not Playwright).
 */

export const PACKAGE = "@qa-guru/allure-notifications-core";
export const PHASE = 3;
/** Locked native PNG backend — see README. */
export const PNG_BACKEND = "@napi-rs/canvas" as const;

export type {
  AllureLabel,
  AllureTestResult,
  CoverageDiffCell,
  GrowthPoint,
  HistoryAnalytics,
  HistoryRun,
  HistoryTestResult,
  ProblemsByEnvironment,
  ReportAnalytics,
  StabilityBar,
  StabilityCase,
  Statistic,
  StatusAgeBucket,
  StatusTransitionPoint,
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
export {
  DEFAULT_HISTORY_FILE,
  DEFAULT_HISTORY_LIMIT,
  STATUS_AGE_BANDS,
  STATUS_KEYS,
  STABILITY_THRESHOLD,
  SUCCESS_BUCKETS,
  historyFromRuns,
  historyWithBuckets,
  isHistoryEmpty,
  loadHistoryAnalytics,
  readHistoryFile,
  resolveGroupByLabel,
  resolveHistoryFile,
  stabilityBarsFromCases,
} from "./report/history.js";
export {
  DEFAULT_TOP_SUITES,
  buildAnalytics,
  loadReportAnalytics,
} from "./report/analytics.js";

export { renderCollagePng, resolveCardTitle } from "./collage/render.js";
export {
  DEFAULT_EMPTY_MESSAGE,
  renderEmptyPanel,
} from "./collage/panels/empty.js";
export {
  PYRAMID_GEOMETRY,
  layerBreakdownFrom,
} from "./collage/panels/pyramid.js";
export { orderedSeverities, renderSeveritiesPanel } from "./collage/panels/severities.js";
export { renderSuitesPanel } from "./collage/panels/suites.js";
export { renderStatusDynamicsPanel } from "./collage/panels/statusDynamics.js";
export { renderSuccessRateDistributionPanel } from "./collage/panels/successRateDistribution.js";
export { renderStatusTransitionsPanel } from "./collage/panels/statusTransitions.js";
export { renderTestBaseGrowthPanel } from "./collage/panels/testBaseGrowth.js";
export { renderCoverageDiffPanel } from "./collage/panels/coverageDiff.js";
export { renderProblemsDistributionPanel } from "./collage/panels/problemsDistribution.js";
export { renderStabilityDistributionPanel } from "./collage/panels/stabilityDistribution.js";
export { renderDurationDynamicsPanel } from "./collage/panels/durationDynamics.js";
export { renderStatusAgePyramidPanel } from "./collage/panels/statusAgePyramid.js";
export { stackedSegmentHeights } from "./collage/panels/bars.js";
export {
  STATUS_RGB,
  themeFromDarkMode,
  hexToRgb,
  rgbCss,
} from "./theme.js";
