/**
 * Free-layout collage renderer (native @napi-rs/canvas).
 * Port of Java CollageRenderer free/grid card chrome — Stage C focuses on free.
 */

import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import {
  isKitOnlyChartItem,
  normalizeChartProfile,
  resolvePanelMeta,
  shouldSilentSkipKitOnlyItem,
  type ChartItem,
  type Config,
} from "@qa-guru/allure-notifications-config";

import type { ReportAnalytics } from "../report/types.js";
import {
  cardBorder,
  headerBackground,
  headerText,
  mixRgb,
  outerBackground,
  rgbCss,
  themeFromDarkMode,
  type ChartTheme,
  type Rgb,
} from "../theme.js";
import { panelContext } from "./context.js";
import { renderCoverageDiffPanel } from "./panels/coverageDiff.js";
import { renderDurationsPanel } from "./panels/durations.js";
import { renderDurationDynamicsPanel } from "./panels/durationDynamics.js";
import {
  DEFAULT_EMPTY_MESSAGE,
  renderEmptyPanel,
} from "./panels/empty.js";
import { renderPiePanel } from "./panels/pie.js";
import { renderProblemsDistributionPanel } from "./panels/problemsDistribution.js";
import {
  layerBreakdownFrom,
  renderPyramidPanel,
} from "./panels/pyramid.js";
import { renderSeveritiesPanel } from "./panels/severities.js";
import { renderStabilityDistributionPanel } from "./panels/stabilityDistribution.js";
import { renderStatusAgePyramidPanel } from "./panels/statusAgePyramid.js";
import { renderStatusDynamicsPanel } from "./panels/statusDynamics.js";
import { renderStatusTransitionsPanel } from "./panels/statusTransitions.js";
import { renderSuccessRateDistributionPanel } from "./panels/successRateDistribution.js";
import { renderSuitesPanel } from "./panels/suites.js";
import { renderTestBaseGrowthPanel } from "./panels/testBaseGrowth.js";
import { renderQualityGatePng } from "./panels/qualityGate.js";
import { renderTestsTablePng } from "./panels/testsTable.js";
import {
  resolveQualityGatePanelId,
  type QualityGateCollageData,
} from "./qualityGateData.js";
import { isTestsTableChartItem } from "./testsTableData.js";
import type { KitTestsTableData } from "@qa-guru/allure-report-kit";

const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 600;
const DEFAULT_GRID_COLS = 10;
const DEFAULT_GRID_ROWS = 10;
const CANON_CARD_GAP = 14;
/** DS `--radius-md` (12px) @ 1080 canvas — same baseline as builder `cardCornerRadiusLogical`. */
const DS_CARD_RADIUS_MD = 12;
const DS_CARD_RADIUS_CANVAS = 1080;
const CARD_BORDER_WIDTH = 1.5;
const BASE_HEADER_HEIGHT = 34;
const CANON_HEADER_HEIGHT = 68;
const CARD_HEADER_PAD_X = 14;
const CARD_DOT_SIZE = 8;
const CARD_DOT_GAP = 5;
const CARD_DOT_TITLE_GAP = 8;
const CARD_TITLE_FONT = 12;
const CARD_DOT_MIX = 0.55;

const DOT_CLOSE: Rgb = { r: 0xff, g: 0x5f, b: 0x57 };
const DOT_MINIMIZE: Rgb = { r: 0xfe, g: 0xbc, b: 0x2e };
const DOT_MAXIMIZE: Rgb = { r: 0x28, g: 0xc8, b: 0x40 };

const PANEL_CURRENT_STATUS = "currentstatus";
const PANEL_PYRAMID = "testingpyramid";
const PANEL_DURATIONS = "durations";
const PANEL_STATUS_DYNAMICS = "statusdynamics";
const PANEL_SUCCESS_RATE = "successratedistribution";
const PANEL_SEVERITIES = "testresultseverities";
const PANEL_SUITES = "suites";
const PANEL_STATUS_TRANSITIONS = "statustransitions";
const PANEL_TEST_BASE_GROWTH = "testbasegrowthdynamics";
const PANEL_COVERAGE_DIFF = "coveragediff";
const PANEL_PROBLEMS = "problemsdistribution";
const PANEL_STABILITY = "stabilitydistribution";
const PANEL_DURATION_DYNAMICS = "durationdynamics";
const PANEL_STATUS_AGE = "statusagepyramid";
const PANEL_QUALITY_GATE = "qualitygate";
const PANEL_TESTS_TABLE = "teststable";

const DEBUG =
  process.env.ALLURE_NOTIFICATIONS_DEBUG === "1" ||
  process.env.ALLURE_NOTIFICATIONS_DEBUG === "true";

function normalize(raw: string | undefined | null): string | null {
  if (raw == null) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  if (key === PANEL_CURRENT_STATUS) {
    return PANEL_CURRENT_STATUS;
  }
  if (key === PANEL_PYRAMID || key === "pyramid") {
    return PANEL_PYRAMID;
  }
  if (key === PANEL_DURATIONS || key === "duration") {
    return PANEL_DURATIONS;
  }
  if (key === PANEL_STATUS_DYNAMICS) {
    return PANEL_STATUS_DYNAMICS;
  }
  if (key === PANEL_SUCCESS_RATE) {
    return PANEL_SUCCESS_RATE;
  }
  if (
    key === PANEL_SEVERITIES ||
    key === "severities" ||
    key === "severity"
  ) {
    return PANEL_SEVERITIES;
  }
  if (key === PANEL_SUITES) {
    return PANEL_SUITES;
  }
  if (key === PANEL_STATUS_TRANSITIONS) {
    return PANEL_STATUS_TRANSITIONS;
  }
  if (key === PANEL_TEST_BASE_GROWTH) {
    return PANEL_TEST_BASE_GROWTH;
  }
  if (key === PANEL_COVERAGE_DIFF) {
    return PANEL_COVERAGE_DIFF;
  }
  if (key === PANEL_PROBLEMS) {
    return PANEL_PROBLEMS;
  }
  if (key === PANEL_STABILITY) {
    return PANEL_STABILITY;
  }
  if (key === PANEL_DURATION_DYNAMICS || key === "duration-trend") {
    return PANEL_DURATION_DYNAMICS;
  }
  if (key === PANEL_STATUS_AGE) {
    return PANEL_STATUS_AGE;
  }
  if (key === PANEL_QUALITY_GATE) {
    return PANEL_QUALITY_GATE;
  }
  return null;
}

/** Panel dispatch key — `type` plus catalog `id` for kit-only kinds. */
function resolvePanelKey(item: ChartItem): string | null {
  if (isTestsTableChartItem(item)) {
    return PANEL_TESTS_TABLE;
  }
  if (isKitOnlyChartItem(item)) {
    return PANEL_QUALITY_GATE;
  }
  return normalize(item.type);
}

function resolveHeaderHeight(config: Config): number {
  const h = config.base.chart?.headerHeight;
  if (h != null && h > 0) {
    return h;
  }
  return CANON_HEADER_HEIGHT;
}

function resolveCardGap(config: Config): number {
  const g = config.base.chart?.cardGap;
  if (g != null && g >= 0) {
    return g;
  }
  return CANON_CARD_GAP;
}

function resolveCardArc(collageWidth: number, collageHeight: number): number {
  if (!(collageWidth > 0) || !(collageHeight > 0)) {
    return DS_CARD_RADIUS_MD;
  }
  const scale = Math.min(collageWidth, collageHeight) / DS_CARD_RADIUS_CANVAS;
  return Math.max(8, Math.min(12, Math.round(DS_CARD_RADIUS_MD * scale)));
}

function clamp(value: number | undefined, min: number, max: number): number {
  if (value == null || Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function defaultFreeItems(): ChartItem[] {
  return [
    { type: "currentStatus", x: 0, y: 0, w: 5, h: 5 },
    { type: "testingPyramid", x: 5, y: 0, w: 5, h: 5 },
    { type: "durations", x: 0, y: 5, w: 10, h: 5 },
  ];
}

function selectedFreeItems(config: Config): ChartItem[] {
  const configured = config.base.chart?.items;
  const items: ChartItem[] = [];
  if (configured) {
    for (const raw of configured) {
      if (raw?.type && raw.type.trim()) {
        items.push(raw);
      }
    }
  }
  return items.length > 0 ? items : defaultFreeItems();
}

function pieTitle(config: Config): string {
  const project = config.base.project;
  return project && project.trim() ? project : "Summary";
}

function pyramidTitle(config: Config, analytics: ReportAnalytics): string {
  const breakdown = layerBreakdownFrom(analytics.layers);
  const fallback = config.base.chart?.pyramidFallback ?? "suites";
  if (!breakdown.knownCounts.size && fallback.toLowerCase() === "suites") {
    return "Suites";
  }
  return "Testing pyramid";
}

/**
 * Card header title: real panels keep Stage C captions; stubs/unknown → PANEL_CATALOG.
 * Exported for unit contract tests (no OCR).
 */
export function resolveCardTitle(
  item: ChartItem,
  config: Config,
  analytics: ReportAnalytics,
): string {
  if (isKitOnlyChartItem(item)) {
    const meta = resolvePanelMeta(item);
    if (meta?.title) {
      return meta.title;
    }
  }
  const key = normalize(item.type);
  if (key === PANEL_CURRENT_STATUS) {
    return pieTitle(config);
  }
  if (key === PANEL_PYRAMID) {
    return pyramidTitle(config, analytics);
  }
  if (key === PANEL_DURATIONS) {
    if (item.groupBy && item.groupBy.trim().toLowerCase() === "layer") {
      return "Durations by layer (s)";
    }
    return "Durations (s)";
  }
  if (key === PANEL_SUITES) {
    return "Suites";
  }
  if (key === PANEL_SEVERITIES) {
    return "Results by severity";
  }
  if (key === PANEL_STATUS_DYNAMICS) {
    return "Status dynamics";
  }
  if (key === PANEL_SUCCESS_RATE) {
    return "Success rate";
  }
  // Catalog titles for remaining analytics panels (incl. groupBy/by variants).
  const meta = resolvePanelMeta({
    type: item.type,
    groupBy: item.groupBy,
    by: item.by,
  });
  if (meta?.title) {
    return meta.title;
  }
  const raw = item.type?.trim();
  return raw && raw.length > 0 ? raw : "Panel";
}

function renderPanelPng(
  key: string | null,
  config: Config,
  theme: ChartTheme,
  width: number,
  height: number,
  analytics: ReportAnalytics,
  groupBy?: string,
  by?: string,
  qualityGates?: QualityGateCollageData,
  item?: ChartItem,
  testsTable?: KitTestsTableData,
  darkMode?: boolean,
): Buffer {
  const ctx = panelContext(config, theme, width, height, analytics, {
    showTitle: false,
    groupBy,
    by,
  });
  if (key === PANEL_CURRENT_STATUS) {
    return renderPiePanel(ctx);
  }
  if (key === PANEL_PYRAMID) {
    return renderPyramidPanel(ctx);
  }
  if (key === PANEL_DURATIONS) {
    return renderDurationsPanel(ctx);
  }
  if (key === PANEL_STATUS_DYNAMICS) {
    return renderStatusDynamicsPanel(ctx);
  }
  if (key === PANEL_SUCCESS_RATE) {
    return renderSuccessRateDistributionPanel(ctx);
  }
  if (key === PANEL_SEVERITIES) {
    return renderSeveritiesPanel(ctx);
  }
  if (key === PANEL_SUITES) {
    return renderSuitesPanel(ctx);
  }
  if (key === PANEL_STATUS_TRANSITIONS) {
    return renderStatusTransitionsPanel(ctx);
  }
  if (key === PANEL_TEST_BASE_GROWTH) {
    return renderTestBaseGrowthPanel(ctx);
  }
  if (key === PANEL_COVERAGE_DIFF) {
    return renderCoverageDiffPanel(ctx);
  }
  if (key === PANEL_PROBLEMS) {
    return renderProblemsDistributionPanel(ctx);
  }
  if (key === PANEL_STABILITY) {
    return renderStabilityDistributionPanel(ctx);
  }
  if (key === PANEL_DURATION_DYNAMICS) {
    return renderDurationDynamicsPanel(ctx);
  }
  if (key === PANEL_STATUS_AGE) {
    return renderStatusAgePyramidPanel(ctx);
  }
  if (key === PANEL_QUALITY_GATE && item) {
    const qgId = resolveQualityGatePanelId(item);
    if (!qgId) {
      throw new Error(
        'qualityGate collage tile requires id "allureQualityGate" or "sonarQualityGate"',
      );
    }
    const data = qualityGates?.[qgId];
    if (!data) {
      throw new Error(`quality gate data not loaded for ${qgId}`);
    }
    return renderQualityGatePng(data, { width, height });
  }
  if (key === PANEL_TESTS_TABLE) {
    if (!testsTable) {
      throw new Error("tests table data not loaded for testsTable tile");
    }
    return renderTestsTablePng(testsTable, { width, height, dark: darkMode });
  }
  // Unknown tiles: empty-state body (card chrome carries title).
  return renderEmptyPanel(ctx, DEFAULT_EMPTY_MESSAGE);
}

async function drawCard(
  graphics: SKRSContext2D,
  panelPng: Buffer,
  rect: { x: number; y: number; w: number; h: number },
  theme: ChartTheme,
  title: string,
  headerHeight: number,
  cardArc: number,
): Promise<void> {
  graphics.save();
  roundRectClip(graphics, rect.x, rect.y, rect.w, rect.h, cardArc);

  const img = await loadImage(panelPng);

  // Hybrid panels (quality-gate) own their chrome — full-bleed PNG, no macOS bar.
  if (headerHeight <= 0) {
    graphics.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    graphics.restore();
    graphics.strokeStyle = rgbCss(cardBorder(theme));
    graphics.lineWidth = CARD_BORDER_WIDTH;
    roundRectStroke(
      graphics,
      rect.x + 0.5,
      rect.y + 0.5,
      rect.w - 1,
      rect.h - 1,
      cardArc,
    );
    return;
  }

  const scale = headerHeight / BASE_HEADER_HEIGHT;
  const padX = Math.max(CARD_HEADER_PAD_X, Math.round(CARD_HEADER_PAD_X * scale));
  const dotSize = Math.max(CARD_DOT_SIZE, Math.round(CARD_DOT_SIZE * scale));
  const dotGap = Math.max(CARD_DOT_GAP, Math.round(CARD_DOT_GAP * scale));
  const dotTitleGap = Math.max(
    CARD_DOT_TITLE_GAP,
    Math.round(CARD_DOT_TITLE_GAP * scale),
  );
  const fontSize = Math.max(CARD_TITLE_FONT, Math.round(CARD_TITLE_FONT * scale));

  const bodyHeight = Math.max(1, rect.h - headerHeight);
  graphics.drawImage(img, rect.x, rect.y + headerHeight, rect.w, bodyHeight);

  const headerBg = headerBackground(theme);
  graphics.fillStyle = rgbCss(headerBg);
  graphics.fillRect(rect.x, rect.y, rect.w, headerHeight);
  graphics.strokeStyle = rgbCss(cardBorder(theme));
  graphics.lineWidth = 1;
  graphics.beginPath();
  graphics.moveTo(rect.x, rect.y + headerHeight);
  graphics.lineTo(rect.x + rect.w, rect.y + headerHeight);
  graphics.stroke();

  let dotX = rect.x + padX;
  const dotY = rect.y + (headerHeight - dotSize) / 2;
  for (const dot of [DOT_CLOSE, DOT_MINIMIZE, DOT_MAXIMIZE]) {
    graphics.fillStyle = rgbCss(mixRgb(dot, headerBg, CARD_DOT_MIX));
    graphics.beginPath();
    graphics.arc(
      dotX + dotSize / 2,
      dotY + dotSize / 2,
      dotSize / 2,
      0,
      Math.PI * 2,
    );
    graphics.fill();
    dotX += dotSize + dotGap;
  }
  const dotsWidth = 3 * dotSize + 2 * dotGap;

  if (title) {
    graphics.fillStyle = rgbCss(headerText(theme));
    graphics.font = `bold ${fontSize}px sans-serif`;
    const ascent = fontSize * 0.8;
    const descent = fontSize * 0.2;
    const baseline =
      rect.y + (headerHeight + ascent - descent) / 2;
    const titleX = rect.x + padX + dotsWidth + dotTitleGap;
    graphics.fillText(title, titleX, baseline);
  }

  graphics.restore();

  graphics.strokeStyle = rgbCss(cardBorder(theme));
  graphics.lineWidth = CARD_BORDER_WIDTH;
  roundRectStroke(
    graphics,
    rect.x + 0.5,
    rect.y + 0.5,
    rect.w - 1,
    rect.h - 1,
    cardArc,
  );
}

function roundRectClip(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.clip();
}

function roundRectStroke(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.stroke();
}

/**
 * Render collage PNG buffer from config + analytics.
 * Stage C: free layout (CB-870 / TG-post). Other layouts fall back to free defaults
 * when `layout !== "free"` only if items are present; otherwise uses free CB-870 grid.
 */
export async function renderCollagePng(
  config: Config,
  analytics: ReportAnalytics,
  qualityGates: QualityGateCollageData = {},
  testsTable?: KitTestsTableData,
): Promise<Buffer> {
  const chart = config.base.chart;
  const collageWidth = chart?.width && chart.width > 0 ? chart.width : DEFAULT_WIDTH;
  const collageHeight =
    chart?.height && chart.height > 0 ? chart.height : DEFAULT_HEIGHT;
  const headerHeight = resolveHeaderHeight(config);
  const cardGap = resolveCardGap(config);
  const cols =
    chart?.gridCols && chart.gridCols > 0 ? chart.gridCols : DEFAULT_GRID_COLS;
  const rows =
    chart?.gridRows && chart.gridRows > 0 ? chart.gridRows : DEFAULT_GRID_ROWS;
  const items = selectedFreeItems(config);
  const profile = normalizeChartProfile(chart?.profile);
  const half = Math.floor(cardGap / 2);
  const cardArc = resolveCardArc(collageWidth, collageHeight);
  const cellW = Math.floor(collageWidth / cols);
  const cellH = Math.floor(collageHeight / rows);

  const theme = themeFromDarkMode(config.base.darkMode);
  const canvas = createCanvas(collageWidth, collageHeight);
  const graphics = canvas.getContext("2d");
  graphics.fillStyle = rgbCss(outerBackground(theme));
  graphics.fillRect(0, 0, collageWidth, collageHeight);

  for (const item of items) {
    if (shouldSilentSkipKitOnlyItem(profile, item)) {
      if (DEBUG) {
        const id = item.id ?? item.type;
        console.error(
          `[allure-notifications] silent-skip kit-only tile ${id} (chart.profile=${profile})`,
        );
      }
      continue;
    }

    const key = resolvePanelKey(item);
    // Unknown / stub types still draw a card — kit-only kinds silent-skip above.
    const title = resolveCardTitle(item, config, analytics);

    let x = clamp(item.x, 0, cols - 1);
    let y = clamp(item.y, 0, rows - 1);
    let w = Math.max(1, item.w ?? 1);
    let h = Math.max(1, item.h ?? 1);
    if (x + w > cols) w = cols - x;
    if (y + h > rows) h = rows - y;

    const rawLeft = x * cellW;
    const rawTop = y * cellH;
    const rawRight = (x + w) * cellW;
    const rawBottom = (y + h) * cellH;
    const cellLeft = x === 0 ? cardGap : rawLeft + half;
    const cellTop = y === 0 ? cardGap : rawTop + half;
    const cellRight = x + w === cols ? collageWidth - cardGap : rawRight - half;
    const cellBottom =
      y + h === rows ? collageHeight - cardGap : rawBottom - half;
    const cellWidth = Math.max(1, cellRight - cellLeft);
    const cellHeight = Math.max(1, cellBottom - cellTop);
    // quality-gate PNG already paints hybrid bar+body — do not reserve collage header.
    const skipCardHeader = key === PANEL_QUALITY_GATE;
    const tileHeaderHeight = skipCardHeader ? 0 : headerHeight;
    const panelHeight = skipCardHeader
      ? cellHeight
      : Math.max(1, cellHeight - headerHeight);

    const panelPng = renderPanelPng(
      key,
      config,
      theme,
      cellWidth,
      panelHeight,
      analytics,
      item.groupBy,
      item.by,
      qualityGates,
      item,
      testsTable,
      config.base.darkMode,
    );
    await drawCard(
      graphics,
      panelPng,
      { x: cellLeft, y: cellTop, w: cellWidth, h: cellHeight },
      theme,
      title,
      tileHeaderHeight,
      cardArc,
    );
  }

  return canvas.toBuffer("image/png");
}
