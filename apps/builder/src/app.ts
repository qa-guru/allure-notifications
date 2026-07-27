import { PHRASES } from './phrases.js';
import {
  CANVAS_PRESETS,
  DEFAULT_CANVAS,
  DEFAULT_CARD_GAP,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_TILE_PAD,
  GRID_COLS,
  GRID_ROWS,
  PANEL_CATALOG,
  PANEL_META,
  createDefaultConfig,
  resolvePanelMeta,
  type ChartItem,
  type PanelMeta,
} from '@allure-notifications/config';
import {
  CORNER_RATIO,
  PYRAMID_COLORS_DARK,
  PYRAMID_COLORS_LIGHT,
  STATUS_COLORS,
  TIER_GAP_RATIO,
} from '@allure-notifications/pyramid';
import { mountHighlightedOutput } from '../vendor/design-system/js/code-highlight.js';

/**
 * apps/builder — TypeScript source (emit → `js/` for Pages / stand).
 * Theme: header.js toggles html.theme-light on the whole page.
 *
 * Free layout on 10×10. Canvas presets: 870×1080 · 1080×1080 · 1410×1080.
 * Output shape matches jar Config (top-level telegram; layout free + items).
 * Middle zone: collage editor + Results caption under canvas; collage previews via bar links.
 *
 * Terminal bar canon (all builders): editable `vector#` in `.panel__bar-end` +
 * icon-only Reset → Download → Copy. Same 8-hex hash as autotests-builder /
 * selenoid Capabilities / react-ui demo; restore via localStorage registry.
 * Terminal body canon: `.panel__code.ch-code` + CodeHighlight (always colored;
 * no blank pad rows before `{` / after `}`).
 *
 * Catalog / presets from `@allure-notifications/config`; pyramid geometry +
 * layer palette from `@allure-notifications/pyramid` (import map → vendor sync).
 * UI-only packing stays local.
 */

type BuilderState = ReturnType<typeof createDefaultConfig>;

/** Default tile footprint + flush 5-up packing on 10-col grid (2×2, no gutters). */
const DEFAULT_TILE_W = 2;
const DEFAULT_TILE_H = 2;
const PACK_COLS = 5;
const PACK_X = Object.freeze([0, 2, 4, 6, 8]);

/** DS `.widget-tile` baseline bar — used to scale title/dots with headerHeight. */
const WT_BAR_BASELINE = 28;

function createDefaultState(): BuilderState {
  return createDefaultConfig();
}

const state: BuilderState = createDefaultState();

let grid: GridStack | null = null;
let selectedEl: HTMLElement | null = null;
let suppressSync = false;
let activeMessenger = 'telegram';
let vectorDraft: string | null = null;
let vectorMiss = false;

const TG_BOT_NAME = 'Test Notifications Bot';
/** Dogfood preview stats — mirrors telegram.ftl when no local summary.json. */
const TG_PREVIEW_STATS: Readonly<{
  total: number;
  passed: number;
  failed: number;
  broken: number;
  unknown: number;
  skipped: number;
  durationMs: number;
}> = Object.freeze({
  total: 8,
  passed: 8,
  failed: 0,
  broken: 0,
  unknown: 0,
  skipped: 0,
  durationMs: 56205,
});
/** Fallback links when Options → links are empty (reference-app dogfood). */
const TG_PREVIEW_LINKS: Readonly<Record<string, string>> = Object.freeze({
  report: 'https://autotests-ai.github.io/reference-app/reports/latest/awesome/index.html',
  dashboard: 'https://autotests-ai.github.io/reference-app/reports/latest/dashboard/index.html',
  testops: 'https://allure.qa.guru/launch/54543',
  build: 'https://github.com/autotests-ai/reference-app/actions/runs/29798732034',
});
const TG_LINK_KEYS = Object.freeze(['report', 'dashboard', 'testops', 'build'] as const);
const VECTOR_REGISTRY_KEY = 'allure-notifications-builder-vector-registry';
/** TG feed bubble width (CSS px) — not export SSOT. */
const TG_FEED_PREVIEW_WIDTH = 480;

let openExportMode: 'tg' | 'full' | null = null;
let openExportTrigger: HTMLElement | null = null;

/**
 * Same 8-hex fingerprint as autotests-builder / selenoid / react-ui demo.
 * @param {unknown} value
 */
function vectorHash(value: unknown) {
  const str = JSON.stringify(value);
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return (`00000000${(h >>> 0).toString(16)}`).slice(-8);
}

/**
 * @param {string} raw
 */
function normalizeVectorId(raw: string) {
  let id = String(raw || '').trim();
  if (!id) return '';
  id = id.replace(/^vector\s*[:#]?\s*/i, '').replace(/^#/, '').trim();
  if (!id) return '';
  return `vector#${id}`;
}

/** Caps snap for hash / registry — no `vector` field (avoid cycle). */
function capsSnap() {
  return {
    base: state.base,
    telegram: state.telegram,
  };
}

function fingerprint() {
  return `vector#${vectorHash(capsSnap())}`;
}

/**
 * @param {Record<string, unknown>} snap
 */
function cloneSnap(snap: Record<string, unknown>) {
  return /** @type {Record<string, unknown>} */ (JSON.parse(JSON.stringify(snap)));
}

/** @returns {Map<string, Record<string, unknown>>} */
function loadVectorRegistry(): Map<string, Record<string, unknown>> {
  const map = new Map();
  const defaults = createDefaultState();
  map.set(fingerprintFromSnap(defaults), cloneSnap(defaults));
  try {
    const raw = localStorage.getItem(VECTOR_REGISTRY_KEY);
    if (!raw) return map;
    const parsed = JSON.parse(raw);
    for (const [id, snap] of Object.entries(parsed)) {
      if (snap && typeof snap === 'object' && 'base' in snap) {
        map.set(id, cloneSnap(/** @type {Record<string, unknown>} */ (snap)));
      }
    }
  } catch {
    /* corrupt / private mode */
  }
  return map;
}

/**
 * @param {Record<string, unknown>} snap
 */
function fingerprintFromSnap(snap: Record<string, unknown>) {
  return `vector#${vectorHash({ base: snap.base, telegram: snap.telegram })}`;
}

/** @type {Map<string, Record<string, unknown>>} */
const vectorRegistry = loadVectorRegistry();

/**
 * @param {Record<string, unknown>} snap
 */
function rememberSnap(snap: Record<string, unknown>) {
  const id = fingerprintFromSnap(snap);
  vectorRegistry.set(id, cloneSnap(snap));
  try {
    const obj: Record<string, Record<string, unknown>> = {};
    vectorRegistry.forEach((s, key) => {
      obj[key] = s;
    });
    localStorage.setItem(VECTOR_REGISTRY_KEY, JSON.stringify(obj));
  } catch {
    /* private mode / quota */
  }
  return id;
}

/**
 * @param {string} path
 * @returns {{ parent: Record<string, unknown>, key: string } | null}
 */
function resolvePath(path: string): { parent: Record<string, unknown>; key: string } | null {
  const parts = path.split('.');
  if (parts.length < 2) return null;
  let cur: Record<string, unknown> = state as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (key == null) return null;
    const next = cur[key];
    if (next == null || typeof next !== 'object') return null;
    cur = next as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (last == null) return null;
  return { parent: cur, key: last };
}

/**
 * @param {string} path
 * @param {unknown} value
 */
function setPath(path: string, value: unknown) {
  const resolved = resolvePath(path);
  if (!resolved) return;
  resolved.parent[resolved.key] = value;
}

/**
 * @param {HTMLInputElement | HTMLSelectElement} el
 * @returns {unknown}
 */
function controlValue(el: HTMLInputElement | HTMLSelectElement): unknown {
  if (el instanceof HTMLInputElement && el.hasAttribute('data-anb-number')) {
    const n = Number(el.value);
    return Number.isFinite(n) ? n : 0;
  }
  return el.value;
}

/**
 * @param {{ width: number, height: number, cardGap?: number, headerHeight?: number, tilePad?: number }} chart
 * @param {ChartItem} item
 */
function freeCellRect(
  chart: { width: number; height: number; cardGap?: number; headerHeight?: number; tilePad?: number },
  item: ChartItem,
) {
  const cardGap =
    chart.cardGap != null && Number.isFinite(Number(chart.cardGap))
      ? Math.max(0, Number(chart.cardGap))
      : DEFAULT_CARD_GAP;
  const half = Math.floor(cardGap / 2);
  const cellW = chart.width / GRID_COLS;
  const cellH = chart.height / GRID_ROWS;
  const x = item.x;
  const y = item.y;
  const w = item.w;
  const h = item.h;
  const rawLeft = x * cellW;
  const rawTop = y * cellH;
  const rawRight = (x + w) * cellW;
  const rawBottom = (y + h) * cellH;
  const left = x === 0 ? cardGap : rawLeft + half;
  const top = y === 0 ? cardGap : rawTop + half;
  const right = x + w === GRID_COLS ? chart.width - cardGap : rawRight - half;
  const bottom = y + h === GRID_ROWS ? chart.height - cardGap : rawBottom - half;
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

/**
 * @param {{ headerHeight?: number, tilePad?: number }} chart
 */
function chromeCssVars(chart: { headerHeight?: number; tilePad?: number }): string {
  const headerHeight =
    chart.headerHeight != null && Number.isFinite(Number(chart.headerHeight))
      ? Math.max(1, Number(chart.headerHeight))
      : DEFAULT_HEADER_HEIGHT;
  const tilePad =
    chart.tilePad != null && Number.isFinite(Number(chart.tilePad))
      ? Math.max(0, Number(chart.tilePad))
      : DEFAULT_TILE_PAD;
  const scale = headerHeight / WT_BAR_BASELINE;
  return (
    `--wt-bar-height:${headerHeight}px;` +
    `--wt-pad:${tilePad}px;` +
    `--wt-title-size:${(0.75 * scale).toFixed(3)}rem;` +
    `--indicator-size:${Math.max(6, Math.round(10 * scale))}px;` +
    `--wt-dot-gap:${Math.max(2, Math.round(5 * scale))}px`
  );
}

/**
 * @param {string} path
 * @returns {unknown}
 */
function getPath(path: string): unknown {
  const resolved = resolvePath(path);
  if (!resolved) return undefined;
  return resolved.parent[resolved.key];
}

function canvasKeyFromState() {
  const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
  const key = `${chart.width}x${chart.height}`;
  return Object.prototype.hasOwnProperty.call(CANVAS_PRESETS, key) ? key : DEFAULT_CANVAS;
}

/**
 * @param {string} key
 */
function applyCanvasPreset(key: string) {
  const preset = CANVAS_PRESETS[key] || CANVAS_PRESETS[DEFAULT_CANVAS];
  const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
  chart.width = preset.w;
  chart.height = preset.h;
  applyCanvasMetrics();
  scheduleFitEditorScale();
  renderMessengerPreview();
}

function applyCanvasMetrics() {
  const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
  const root = document.documentElement;
  /* unitless — used by CSS aspect-ratio */
  root.style.setProperty('--anb-canvas-w', String(chart.width));
  root.style.setProperty('--anb-canvas-h', String(chart.height));
}

/**
 * Drive `--layer-*` + geometry ratios from `@pyramid` (SSOT over DS token pin).
 * Dark = `:root`, light = `html.theme-light` — header theme toggle stays untouched.
 */
function injectPyramidSsot() {
  const id = 'anb-pyramid-ssot';
  let style = document.getElementById(id);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  const layerBlock = (colors: Record<string, string>) =>
    Object.entries(colors)
      .map(([layer, hex]) => `  --layer-${layer}: ${hex};`)
      .join('\n');
  style.textContent = [
    ':root {',
    layerBlock(PYRAMID_COLORS_DARK),
    `  --anb-pyramid-corner-ratio: ${CORNER_RATIO};`,
    `  --anb-pyramid-tier-gap-ratio: ${TIER_GAP_RATIO};`,
    `  --anb-pyramid-unit: ${STATUS_COLORS.passed};`,
    '}',
    'html.theme-light {',
    layerBlock(PYRAMID_COLORS_LIGHT),
    '}',
  ].join('\n');
}

/**
 * Logical canvas px → displayed height from shell width (GridStack must not pin old height).
 * @param {HTMLElement} canvas
 */
function canvasDisplayHeight(canvas: HTMLElement) {
  const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
  const displayW = canvas.getBoundingClientRect().width;
  if (!(displayW > 0) || !(chart.width > 0)) return 0;
  return (displayW * chart.height) / chart.width;
}

/** Sync GridStack cellHeight to the displayed canvas height (no transform scale). */
function fitEditorScale() {
  const canvas = document.getElementById('anb-canvas');
  const gridEl = document.getElementById('anb-grid');
  if (!canvas || !grid) return;
  const displayH = canvasDisplayHeight(canvas);
  if (!(displayH > 0)) return;
  const cellH = displayH / GRID_ROWS;
  grid.cellHeight(cellH);
  if (gridEl instanceof HTMLElement) {
    gridEl.style.height = `${displayH}px`;
  }
  if (typeof grid.onParentResize === 'function') {
    grid.onParentResize();
  }
}

/**
 * Toggle GridStack layout animation. Off during fit/load so cellHeight
 * updates do not slide widgets (looks like pyramid "appearing then dropping").
 * @param {boolean} on
 */
function setGridAnimate(on: boolean) {
  if (!grid) return;
  if (typeof grid.setAnimation === 'function') grid.setAnimation(on);
  else if (grid.opts) grid.opts.animate = on;
  const gridEl = document.getElementById('anb-grid');
  if (gridEl) gridEl.classList.toggle('grid-stack-animate', on);
}

/**
 * Fit cellHeight (no animate), flush layout, paint mocks once — same path for
 * every chart. No hide/settle/ResizeObserver hacks.
 */
function fitAndFillEditor() {
  if (!grid) return;
  setGridAnimate(false);
  fitEditorScale();
  const gridEl = document.getElementById('anb-grid');
  if (gridEl) void gridEl.offsetHeight;
  fillEditorMocks();
  setGridAnimate(true);
}

function scheduleFitEditorScale() {
  requestAnimationFrame(fitAndFillEditor);
}

function configJsonText() {
  const vector = fingerprint();
  return JSON.stringify({ ...cloneSnap(capsSnap()), vector }, null, 2);
}

function renderVectorInput() {
  const input = document.getElementById('anb-term-vector');
  if (!(input instanceof HTMLInputElement)) return;
  const vectorId = fingerprint();
  if (vectorDraft == null) {
    input.value = vectorId;
  }
  input.size = Math.max(12, (vectorDraft ?? vectorId).length);
  input.classList.toggle('anb-vector-input--miss', vectorMiss);
  input.setAttribute('aria-invalid', vectorMiss ? 'true' : 'false');
  input.title = vectorMiss
    ? 'Не найден в localStorage — сначала получи этот vector, меняя опции'
    : 'Отпечаток конфига · вставь известный vector# + Enter — подтянуть';
}

function renderTerminal() {
  rememberSnap(capsSnap());
  const el = document.getElementById('anb-terminal');
  mountHighlightedOutput(el, configJsonText(), 'json');
  if (vectorDraft == null) renderVectorInput();
}

/**
 * @param {Record<string, unknown>} snap
 */
function applySnap(snap: Record<string, unknown>) {
  const next = cloneSnap(snap);
  state.base = /** @type {Record<string, unknown>} */ (next.base);
  state.telegram = /** @type {Record<string, unknown>} */ (next.telegram);
  vectorDraft = null;
  vectorMiss = false;
  rememberSnap(capsSnap());
  hydrateControls();
  applyCanvasMetrics();
  const chart = /** @type {{ items?: ChartItem[] }} */ (state.base.chart);
  loadItems(Array.isArray(chart.items) ? chart.items.map((p) => ({ ...p })) : []);
  setActiveMessenger('telegram');
  scheduleFitEditorScale();
  renderTerminal();
  renderMessengerPreview();
  renderVectorInput();
}

/**
 * @param {string} raw
 */
function commitVector(raw: string) {
  const vectorId = fingerprint();
  const normalized = normalizeVectorId(raw);
  vectorDraft = null;
  if (!normalized || normalized === vectorId) {
    vectorMiss = false;
    renderVectorInput();
    return;
  }
  const snap = vectorRegistry.get(normalized);
  if (!snap) {
    vectorMiss = true;
    renderVectorInput();
    return;
  }
  applySnap(snap);
}

function wireVectorInput() {
  const input = document.getElementById('anb-term-vector');
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener('input', () => {
    vectorDraft = input.value;
    vectorMiss = false;
    input.size = Math.max(12, input.value.length);
    input.classList.remove('anb-vector-input--miss');
    input.setAttribute('aria-invalid', 'false');
  });
  input.addEventListener('blur', () => {
    commitVector(input.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    }
    if (e.key === 'Escape') {
      vectorDraft = null;
      vectorMiss = false;
      renderVectorInput();
      input.blur();
    }
  });
  renderVectorInput();
}

async function copyConfigJson() {
  const text = configJsonText();
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* fall through */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function downloadConfigJson() {
  const blob = new Blob([configJsonText()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'config.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * @param {number} n
 */
function escapeHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} lang
 */
function phrasesFor(lang: string) {
  return PHRASES[(lang in PHRASES ? lang : 'en') as keyof typeof PHRASES];
}

/**
 * @param {number} ms
 */
function formatDurationMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const frac = ms % 1000;
  return (
    `${String(h).padStart(2, '0')}:` +
    `${String(m).padStart(2, '0')}:` +
    `${String(s).padStart(2, '0')}.` +
    `${String(frac).padStart(3, '0')}`
  );
}

/**
 * @param {number} input
 * @param {number} total
 */
function formatPercentage(input: number, total: number) {
  if (!total || !input) return '';
  const pct = Math.round((input * 1000) / total) / 10;
  const text = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  return ` (${text} %)`;
}

/** Mirrors jar `/templates/telegram.ftl` + `utils.ftl` (preview stats are fixed). */
function buildTgCaptionHtml() {
  const base = /** @type {{
    environment: string,
    comment: string,
    language: string,
    links: Record<string, string>,
  }} */ (state.base);
  const phrases = phrasesFor(base.language || 'en');
  const env = base.environment ?? '';
  const comment = base.comment ?? '';
  const stats = TG_PREVIEW_STATS;
  const time = formatDurationMs(stats.durationMs);
  const links = base.links || {};

  /** @type {string[]} */
  const lines = [
    `<b>${escapeHtml(phrases.results)}:</b>`,
    `<b>${escapeHtml(phrases.environment)}:</b> ${escapeHtml(env)}`,
    `<b>${escapeHtml(phrases.comment)}:</b> ${escapeHtml(comment)}`,
    `<b>${escapeHtml(phrases.scenario.duration)}:</b> ${escapeHtml(time)}`,
    `<b>${escapeHtml(phrases.scenario.totalScenarios)}:</b> ${stats.total}`,
  ];

  if (stats.passed !== 0) {
    lines.push(
      `<b>${escapeHtml(phrases.scenario.totalPassed)}:</b> ${stats.passed}${formatPercentage(stats.passed, stats.total)}`,
    );
  }
  if (stats.failed !== 0) {
    lines.push(
      `<b>${escapeHtml(phrases.scenario.totalFailed)}:</b> ${stats.failed}${formatPercentage(stats.failed, stats.total)}`,
    );
  }
  if (stats.broken !== 0) {
    lines.push(`<b>${escapeHtml(phrases.scenario.totalBroken)}:</b> ${stats.broken}`);
  }
  if (stats.unknown !== 0) {
    lines.push(`<b>${escapeHtml(phrases.scenario.totalUnknown)}:</b> ${stats.unknown}`);
  }
  if (stats.skipped !== 0) {
    lines.push(`<b>${escapeHtml(phrases.scenario.totalSkipped)}:</b> ${stats.skipped}`);
  }

  TG_LINK_KEYS.forEach((key) => {
    const url = links[key] || TG_PREVIEW_LINKS[key];
    if (!url) return;
    const label = phrases.links[key];
    lines.push(
      `<b>${escapeHtml(label)}:</b> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`,
    );
  });

  return lines.join('\n');
}

/**
 * Mini-render of free-layout items into TG photo stage (logical canvas px → scale).
 * Uses DS widget-tile + WidgetTileMocks (not anb-tg__tile placeholder).
 * Chrome: headerHeight → `--wt-bar-height` (+ proportional title/dots);
 * cardGap → jar free-grid half-gap inset; tilePad → `--wt-pad` (preview-only).
 * @param {ChartItem} item
 */
function previewItemHtml(item: ChartItem) {
  const chart = /** @type {{ width: number, height: number, headerHeight?: number, cardGap?: number, tilePad?: number }} */ (
    state.base.chart
  );
  const rect = freeCellRect(chart, item);
  const meta = resolvePanelMeta(item);
  const title = meta ? meta.title : item.type;
  const chartType = item.type === 'pie' ? 'currentStatus' : item.type;
  const groupBy = item.groupBy || meta?.groupBy || '';
  const by = item.by || meta?.by || '';
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (groupBy) attrs += ` data-group-by="${escapeHtml(groupBy)}"`;
  if (by) attrs += ` data-by="${escapeHtml(by)}"`;
  const chrome = chromeCssVars(chart);
  return (
    `<figure class="widget-tile anb-tg__widget" ${attrs} ` +
    `style="left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;${chrome}">` +
    `<div class="widget-tile__bar">` +
    `<span class="widget-tile__title">${escapeHtml(title)}</span>` +
    `</div>` +
    `<div class="widget-tile__body"></div>` +
    `</figure>`
  );
}

/**
 * @param {HTMLElement} stage
 * @param {'tg' | 'full'} mode
 */
function renderCollageStage(stage: HTMLElement, mode: 'tg' | 'full') {
  const chart = /** @type {{ width: number, height: number, items: ChartItem[] }} */ (
    state.base.chart
  );
  const items = Array.isArray(chart.items) ? chart.items : [];
  stage.innerHTML = items.map(previewItemHtml).join('');
  stage.style.width = `${chart.width}px`;
  stage.style.height = `${chart.height}px`;
  if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
    window.WidgetTileMocks.fill(stage, { force: true });
  }

  const viewport = document.getElementById('anb-export-popover-viewport');
  const meta = document.getElementById('anb-export-popover-meta');
  let scale = 1;
  if (mode === 'tg') {
    scale = TG_FEED_PREVIEW_WIDTH / chart.width;
  } else {
    // Keep in sync with .anb-export-popover max-width/max-height + pad/meta chrome.
    const maxBoxW = Math.min(window.innerWidth * 0.98, 1460) - 20;
    const maxBoxH = Math.min(window.innerHeight * 0.96, 1160) - 48;
    scale = Math.min(1, maxBoxW / chart.width, maxBoxH / chart.height);
  }
  stage.style.transform = scale === 1 ? 'none' : `scale(${scale})`;

  const displayW = Math.round(chart.width * scale);
  const displayH = Math.round(chart.height * scale);
  if (viewport instanceof HTMLElement) {
    viewport.style.width = `${displayW}px`;
    viewport.style.height = `${displayH}px`;
  }
  if (meta) {
    if (mode === 'tg') {
      meta.textContent = `${displayW}×${displayH} · TG feed preview (~${TG_FEED_PREVIEW_WIDTH}px wide)`;
    } else {
      meta.textContent = `${chart.width}×${chart.height} · full canvas export`;
    }
  }
}

/**
 * @param {'tg' | 'full'} mode
 * @param {HTMLElement} anchor
 */
function showExportPopover(mode: 'tg' | 'full', anchor: HTMLElement) {
  const popover = document.getElementById('anb-export-popover');
  const stage = document.getElementById('anb-export-popover-stage');
  if (!(popover instanceof HTMLElement) || !(stage instanceof HTMLElement)) return;

  openExportMode = mode;
  openExportTrigger = anchor;
  document.querySelectorAll('.anb-export-trigger').forEach((btn) => {
    btn.classList.toggle('is-open', btn === anchor);
  });

  renderCollageStage(stage, mode);
  popover.hidden = false;

  requestAnimationFrame(() => {
    if (!(anchor instanceof HTMLElement)) return;
    const rect = anchor.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    if (left + popRect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - popRect.width - 8);
    }
    if (top + popRect.height > window.innerHeight - 8) {
      top = Math.max(8, rect.top - popRect.height - 8);
    }
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  });
}

function hideExportPopover() {
  const popover = document.getElementById('anb-export-popover');
  if (popover instanceof HTMLElement) popover.hidden = true;
  openExportMode = null;
  openExportTrigger = null;
  document.querySelectorAll('.anb-export-trigger').forEach((btn) => {
    btn.classList.remove('is-open');
  });
}

function refreshExportPopoverIfOpen() {
  if (!openExportMode || !openExportTrigger) return;
  const stage = document.getElementById('anb-export-popover-stage');
  if (!(stage instanceof HTMLElement)) return;
  renderCollageStage(stage, openExportMode);
  showExportPopover(openExportMode, openExportTrigger);
}

function wireExportPreviews() {
  const group = document.querySelector('[data-testid="anb-export-links"]');
  if (!(group instanceof HTMLElement)) return;

  /** @param {'tg' | 'full'} mode @param {HTMLElement} trigger */
function open(mode: 'tg' | 'full', trigger: HTMLElement) {
    if (openExportMode === mode && openExportTrigger === trigger) {
      hideExportPopover();
      return;
    }
    showExportPopover(mode, trigger);
  }

  group.querySelectorAll('[data-anb-export]').forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const mode = btn.getAttribute('data-anb-export');
    if (mode !== 'tg' && mode !== 'full') return;

    btn.addEventListener('mouseenter', () => {
      open(mode, btn);
    });
    btn.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        e.preventDefault();
        open(mode, btn);
      }
    });
    btn.addEventListener('focus', () => {
      open(mode, btn);
    });
  });

  group.addEventListener('mouseleave', (e) => {
    const related = e.relatedTarget;
    const popover = document.getElementById('anb-export-popover');
    if (related instanceof Node && (group.contains(related) || popover?.contains(related))) {
      return;
    }
    hideExportPopover();
  });

  const popover = document.getElementById('anb-export-popover');
  if (popover instanceof HTMLElement) {
    popover.addEventListener('mouseleave', (e) => {
      const related = e.relatedTarget;
      if (related instanceof Node && (group.contains(related) || popover.contains(related))) {
        return;
      }
      hideExportPopover();
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (!(e.target instanceof Node)) return;
    if (group.contains(e.target) || popover?.contains(e.target)) return;
    hideExportPopover();
  });

  window.addEventListener('resize', () => {
    refreshExportPopoverIfOpen();
  });
}

function renderMessengerPreview() {
  const nameEl = document.getElementById('anb-tg-bot-name');
  const textEl = document.getElementById('anb-tg-text');
  if (nameEl) nameEl.textContent = TG_BOT_NAME;
  if (textEl) textEl.innerHTML = buildTgCaptionHtml();
  refreshExportPopoverIfOpen();
}

/**
 * @param {string} id
 */
function setActiveMessenger(id: string) {
  activeMessenger = id;
  document.querySelectorAll('[data-anb-messenger]').forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const on = btn.getAttribute('data-anb-messenger') === id;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('[data-anb-messenger-pane]').forEach((pane) => {
    if (!(pane instanceof HTMLElement)) return;
    const on = pane.getAttribute('data-anb-messenger-pane') === id;
    pane.hidden = !on;
  });
  if (id === 'telegram') {
    scheduleFitEditorScale();
  }
}

function wireMessengerTabs() {
  const tabs = document.getElementById('anb-messenger-tabs');
  if (!tabs) return;
  tabs.addEventListener('click', (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    const tab = t.closest('[data-anb-messenger]');
    if (!(tab instanceof HTMLElement) || !tabs.contains(tab)) return;
    if (tab.classList.contains('anb-messenger-tabs__btn--stub')) return;
    if (tab.getAttribute('aria-disabled') === 'true') return;
    const id = tab.getAttribute('data-anb-messenger');
    if (!id) return;
    setActiveMessenger(id);
  });
}

/**
 * @param {HTMLElement} root
 * @param {boolean} value
 */
function syncBoolSeg(root: HTMLElement, value: boolean) {
  const want = value ? 'true' : 'false';
  root.querySelectorAll('.plaque-field-seg__btn').forEach((btn) => {
    const on = btn.getAttribute('data-value') === want;
    btn.classList.toggle('plaque-field-seg__btn--on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

/**
 * Mirror jar flags onto the collage preview: `base.darkMode` → canvas theme,
 * `base.enableChart` → editor/chart chrome gated.
 */
function applyChartFlags() {
  const enableChart = Boolean(getPath('base.enableChart'));
  const darkMode = Boolean(getPath('base.darkMode'));

  const canvas = document.getElementById('anb-canvas');
  if (canvas instanceof HTMLElement) {
    canvas.dataset.anbDark = darkMode ? 'true' : 'false';
  }

  const shell = document.getElementById('anb-canvas-shell');
  if (shell instanceof HTMLElement) {
    shell.classList.toggle('anb-canvas-shell--chart-off', !enableChart);
    shell.setAttribute('aria-disabled', enableChart ? 'false' : 'true');
  }

  const chartGroup = document.querySelector('[data-testid="anb-group-chart"]');
  if (chartGroup instanceof HTMLElement) {
    chartGroup.classList.toggle('is-disabled', !enableChart);
    chartGroup.querySelectorAll('input, select').forEach((el) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.disabled = !enableChart;
      }
    });
  }

  const palette = document.getElementById('anb-palette');
  if (palette instanceof HTMLElement) {
    palette.classList.toggle('is-disabled', !enableChart);
    palette.setAttribute('aria-disabled', enableChart ? 'false' : 'true');
  }

  const resetBtn = document.getElementById('anb-btn-reset');
  const clearBtn = document.getElementById('anb-btn-clear');
  if (resetBtn instanceof HTMLButtonElement) resetBtn.disabled = !enableChart;
  if (clearBtn instanceof HTMLButtonElement) clearBtn.disabled = !enableChart;
  updateToolbar();
}

function hydrateControls() {
  const root = document.getElementById('anb-options');
  if (!root) return;

  root.querySelectorAll('[data-anb-path]').forEach((el) => {
    const path = el.getAttribute('data-anb-path');
    if (!path) return;
    const value = getPath(path);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
      el.value = value == null ? '' : String(value);
    }
  });

  root.querySelectorAll('[data-anb-bool]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const path = el.getAttribute('data-anb-bool');
    if (!path) return;
    syncBoolSeg(el, Boolean(getPath(path)));
  });

  const canvas = root.querySelector('[data-anb-canvas]');
  if (canvas instanceof HTMLSelectElement) {
    canvas.value = canvasKeyFromState();
  }

  applyChartFlags();
}

function bindControls() {
  const root = document.getElementById('anb-options');
  if (!root) return;

  root.addEventListener('input', (event) => {
    const t = event.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement)) return;
    if (t.hasAttribute('data-anb-canvas')) {
      applyCanvasPreset(t.value);
      renderTerminal();
      return;
    }
    const path = t.getAttribute('data-anb-path');
    if (!path) return;
    setPath(path, controlValue(t));
    renderTerminal();
    renderMessengerPreview();
  });

  root.addEventListener('change', (event) => {
    const t = event.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement)) return;
    if (t.hasAttribute('data-anb-canvas')) {
      applyCanvasPreset(t.value);
      renderTerminal();
      return;
    }
    const path = t.getAttribute('data-anb-path');
    if (!path) return;
    setPath(path, controlValue(t));
    renderTerminal();
    renderMessengerPreview();
  });

  root.addEventListener('click', (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    const btn = t.closest('.plaque-field-seg__btn');
    if (!(btn instanceof HTMLButtonElement) || !root.contains(btn)) return;
    const field = btn.closest('[data-anb-bool]');
    if (!(field instanceof HTMLElement)) return;
    const path = field.getAttribute('data-anb-bool');
    if (!path) return;
    const raw = btn.getAttribute('data-value');
    const value = raw === 'true';
    setPath(path, value);
    syncBoolSeg(field, value);
    applyChartFlags();
    renderTerminal();
    renderMessengerPreview();
  });
}

/**
 * @param {ChartItem} a
 * @param {ChartItem} b
 */
function rectsOverlap(a: ChartItem, b: ChartItem) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

/**
 * @param {Partial<ChartItem> & { type: string, id?: string }} raw
 * @returns {ChartItem | null}
 */
function clampItem(raw: Partial<ChartItem> & { type: string; id?: string }): ChartItem | null {
  const meta = resolvePanelMeta(raw);
  if (!meta) return null;
  const w = Math.max(1, Math.min(GRID_COLS, Math.round(raw.w ?? meta.defaultW)));
  const h = Math.max(1, Math.min(GRID_ROWS, Math.round(raw.h ?? meta.defaultH)));
  const x = Math.max(0, Math.min(GRID_COLS - w, Math.round(raw.x ?? 0)));
  const y = Math.max(0, Math.min(GRID_ROWS - h, Math.round(raw.y ?? 0)));
  const item: ChartItem = { type: meta.type, x, y, w, h };
  if (meta.groupBy) item.groupBy = meta.groupBy;
  if (meta.by) item.by = meta.by;
  return item;
}

/** @returns {ChartItem[]} */
function readItemsFromGrid(): ChartItem[] {
  if (!grid) return [];
  return (grid.engine?.nodes ?? [])
    .map((node) => {
      const el = /** @type {HTMLElement | undefined} */ (node.el);
      const type = el?.dataset?.type || /** @type {{ type?: string }} */ (node).type;
      if (!type) return null;
      const inner = el?.querySelector('.widget-tile[data-group-by], .widget-tile[data-by]');
      return clampItem({
        type,
        groupBy:
          el?.dataset?.groupBy ||
          (inner instanceof HTMLElement ? inner.getAttribute('data-group-by') : undefined) ||
          undefined,
        by:
          el?.dataset?.by ||
          (inner instanceof HTMLElement ? inner.getAttribute('data-by') : undefined) ||
          undefined,
        x: node.x ?? 0,
        y: node.y ?? 0,
        w: node.w ?? 1,
        h: node.h ?? 1,
      });
    })
    .filter((item): item is ChartItem => item != null);
}

function syncItemsToState() {
  if (suppressSync) return;
  const chart = /** @type {{ layout: string, items: ChartItem[], gridCols: number, gridRows: number }} */ (
    state.base.chart
  );
  chart.layout = 'free';
  chart.gridCols = GRID_COLS;
  chart.gridRows = GRID_ROWS;
  chart.items = readItemsFromGrid();
  const layoutSelect = document.querySelector('[data-anb-path="base.chart.layout"]');
  if (layoutSelect instanceof HTMLSelectElement) {
    layoutSelect.value = 'free';
  }
  updateEmptyState();
  updateToolbar();
  renderTerminal();
  renderMessengerPreview();
}

function updateEmptyState() {
  const empty = document.getElementById('anb-empty');
  if (!empty) return;
  empty.hidden = readItemsFromGrid().length > 0;
}

function updateToolbar() {
  const copyBtn = document.getElementById('anb-btn-copy');
  const delBtn = document.getElementById('anb-btn-delete');
  const chartOn = Boolean(getPath('base.enableChart'));
  const on = chartOn && Boolean(selectedEl);
  if (copyBtn instanceof HTMLButtonElement) copyBtn.disabled = !on;
  if (delBtn instanceof HTMLButtonElement) delBtn.disabled = !on;
}

/**
 * @param {HTMLElement | null} el
 */
function selectItem(el: HTMLElement | null): void {
  if (selectedEl) selectedEl.classList.remove('is-selected');
  selectedEl = el;
  if (selectedEl) selectedEl.classList.add('is-selected');
  updateToolbar();
}

function clearSelection() {
  selectItem(null);
}

/**
 * @param {ChartItem} item
 */
function panelInnerHtml(item: ChartItem) {
  const meta = resolvePanelMeta(item);
  const title = meta ? meta.title : item.type;
  const chartType = item.type === 'pie' ? 'currentStatus' : item.type;
  const tier =
    typeof WidgetTileMocks !== 'undefined' && WidgetTileMocks.tierForSpan
      ? WidgetTileMocks.tierForSpan(GRID_COLS, item.w, item.h)
      : 'regular';
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (item.groupBy) attrs += ` data-group-by="${escapeHtml(item.groupBy)}"`;
  else if (meta?.groupBy) attrs += ` data-group-by="${escapeHtml(meta.groupBy)}"`;
  if (item.by) attrs += ` data-by="${escapeHtml(item.by)}"`;
  else if (meta?.by) attrs += ` data-by="${escapeHtml(meta.by)}"`;
  return (
    `<div class="anb-panel__bar">` +
    `<span class="anb-panel__title">${escapeHtml(title)}</span>` +
    `<span class="anb-panel__actions">` +
    `<button type="button" class="anb-panel__action" data-anb-action="copy" title="Copy" aria-label="Copy">⎘</button>` +
    `<button type="button" class="anb-panel__action" data-anb-action="delete" title="Delete" aria-label="Delete">×</button>` +
    `</span>` +
    `</div>` +
    `<div class="anb-panel__body">` +
    `<div class="widget-tile widget-tile--tier-${tier} anb-panel__tile" ${attrs}>` +
    `<div class="widget-tile__body"></div>` +
    `</div>` +
    `</div>`
  );
}

/**
 * @param {ParentNode | null} [root]
 */
function fillEditorMocks(root?: ParentNode | null): void {
  const scope = root || document.getElementById('anb-grid');
  if (!scope) return;
  if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
    window.WidgetTileMocks.fill(scope, { force: true });
  }
}

/**
 * @param {ChartItem} item
 */
function makeWidgetEl(item: ChartItem) {
  const el = document.createElement('div');
  el.className = 'grid-stack-item';
  el.dataset.type = item.type;
  if (item.groupBy) el.dataset.groupBy = item.groupBy;
  if (item.by) el.dataset.by = item.by;
  el.setAttribute('gs-x', String(item.x));
  el.setAttribute('gs-y', String(item.y));
  el.setAttribute('gs-w', String(item.w));
  el.setAttribute('gs-h', String(item.h));
  el.setAttribute('gs-min-w', '1');
  el.setAttribute('gs-min-h', '1');
  const content = document.createElement('div');
  content.className = `grid-stack-item-content anb-panel anb-panel--${item.type}`;
  content.innerHTML = panelInnerHtml(item);
  el.appendChild(content);
  return el;
}

/**
 * @param {number} w
 * @param {number} h
 * @param {number | null | undefined} preferX
 * @param {number | null | undefined} preferY
 */
function findFreeSpot(w: number, h: number, preferX: number | null | undefined, preferY: number | null | undefined) {
  const occupied = readItemsFromGrid();
  /** @param {number} x @param {number} y */
function overlaps(x: number, y: number) {
    return occupied.some((p) => rectsOverlap({ type: '_', x, y, w, h }, p));
  }
  /** @param {number} x @param {number} y */
function fits(x: number, y: number) {
    return x + w <= GRID_COLS && y + h <= GRID_ROWS && !overlaps(x, y);
  }
  if (preferX != null && preferY != null && fits(preferX, preferY)) {
    return { x: preferX, y: preferY };
  }
  if (preferX == null && preferY == null && w <= DEFAULT_TILE_W && h <= DEFAULT_TILE_H) {
    for (let row = 0; row <= GRID_ROWS - h; row += DEFAULT_TILE_H) {
      for (let slot = 0; slot < PACK_COLS; slot += 1) {
        const x = PACK_X[slot];
        const y = row;
        if (fits(x, y)) return { x, y };
      }
    }
  }
  for (let y = 0; y <= GRID_ROWS - h; y += 1) {
    for (let x = 0; x <= GRID_COLS - w; x += 1) {
      if (fits(x, y)) return { x, y };
    }
  }
  return null;
}

/**
 * @param {string} panelId catalog id (or ChartType alias for CB-870 types)
 * @param {{ w?: number, h?: number, x?: number, y?: number, preferX?: number, preferY?: number }} [opts]
 */
function addItem(panelId: string, opts: { w?: number; h?: number; x?: number; y?: number; preferX?: number; preferY?: number } = {}) {
  const meta = PANEL_META[panelId] || resolvePanelMeta({ type: panelId });
  if (!meta || !grid) return;
  /* New tiles from palette → 2×2. Explicit w/h (copy, drop spot) win; grid presets stay in DEFAULT_ITEMS. */
  const w = Math.max(1, opts.w || DEFAULT_TILE_W);
  const h = Math.max(1, opts.h || DEFAULT_TILE_H);
  const preferX = opts.preferX != null ? opts.preferX : opts.x;
  const preferY = opts.preferY != null ? opts.preferY : opts.y;
  const spot = findFreeSpot(w, h, preferX, preferY);
  if (!spot) {
    window.alert(`No space for ${meta.id} (${w}×${h})`);
    return;
  }
  const item = clampItem({
    type: meta.type,
    groupBy: meta.groupBy,
    by: meta.by,
    x: spot.x,
    y: spot.y,
    w,
    h,
  });
  if (!item) return;
  const el = makeWidgetEl(item);
  grid.makeWidget(el);
  if (el.gridstackNode) {
    /** @type {{ type?: string, minW?: number, minH?: number }} */ (el.gridstackNode).type =
      item.type;
    el.gridstackNode.minW = 1;
    el.gridstackNode.minH = 1;
  }
  selectItem(el);
  fillEditorMocks(el);
  syncItemsToState();
}

/**
 * @param {HTMLElement} el
 */
function copyItem(el: HTMLElement) {
  const node = el.gridstackNode;
  if (!node) return;
  const type = el.dataset.type;
  if (!type) return;
  const meta = resolvePanelMeta({
    type,
    groupBy: el.dataset.groupBy || undefined,
    by: el.dataset.by || undefined,
  });
  if (!meta) return;
  const w = Math.max(1, node.w ?? 1);
  const h = Math.max(1, node.h ?? 1);
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  /* Prefer flush right of source; else same column one row down. */
  addItem(meta.id, {
    w,
    h,
    preferX: Math.min(GRID_COLS - w, x + w),
    preferY: y,
  });
}

/**
 * @param {HTMLElement} el
 */
function deleteItem(el: HTMLElement) {
  if (!grid || !el) return;
  if (selectedEl === el) clearSelection();
  grid.removeWidget(el, true, true);
  syncItemsToState();
}

/**
 * @param {ChartItem[]} items
 */
function loadItems(items: ChartItem[]) {
  if (!grid) return;
  suppressSync = true;
  setGridAnimate(false);
  fitEditorScale();
  grid.removeAll(true);
  clearSelection();
  items.forEach((raw) => {
    const item = clampItem(raw);
    if (!item) return;
    const el = makeWidgetEl(item);
    grid!.makeWidget(el);
    if (el.gridstackNode) {
      /** @type {{ type?: string }} */ (el.gridstackNode).type = item.type;
      el.gridstackNode.minW = 1;
      el.gridstackNode.minH = 1;
    }
  });
  const gridEl = document.getElementById('anb-grid');
  if (gridEl) void gridEl.offsetHeight;
  fillEditorMocks();
  setGridAnimate(true);
  suppressSync = false;
  syncItemsToState();
}

/** Full reset → CB-870 default (canvas 870×1080 + DEFAULT_ITEMS + empty fields). */
function resetToDefault() {
  applySnap(createDefaultState());
}

function clearAll() {
  if (!grid) return;
  suppressSync = true;
  grid.removeAll(true);
  clearSelection();
  suppressSync = false;
  syncItemsToState();
}

/**
 * @param {PanelMeta} item
 * @returns {string}
 */
function paletteItemHtml(item: PanelMeta): string {
  const chartType = item.type === 'pie' ? 'currentStatus' : item.type;
  const hint = `${DEFAULT_TILE_W}×${DEFAULT_TILE_H}`;
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (item.groupBy) attrs += ` data-group-by="${escapeHtml(item.groupBy)}"`;
  if (item.by) attrs += ` data-by="${escapeHtml(item.by)}"`;
  /* Palette thumbs are always 2×2 — grid footprints stay on canvas / DEFAULT_ITEMS. */
  return (
    `<button type="button" class="anb-palette__item" data-anb-panel-id="${escapeHtml(item.id)}" ` +
    `data-testid="anb-palette-${escapeHtml(item.id)}" draggable="true" title="${escapeHtml(item.title)}">` +
    `<div class="widget-tile widget-tile--tier-micro widget-tile--span-2x2 anb-palette__tile" ${attrs}>` +
    `<div class="widget-tile__bar">` +
    `<span class="widget-tile__title">${escapeHtml(item.title)}</span>` +
    `</div>` +
    `<div class="widget-tile__body"></div>` +
    `</div>` +
    `<span class="anb-palette__hint">${hint}</span>` +
    `</button>`
  );
}

function renderPalette() {
  const palette = document.getElementById('anb-palette');
  if (!palette) return;
  palette.innerHTML = PANEL_CATALOG.map(paletteItemHtml).join('');
  if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
    window.WidgetTileMocks.fill(palette, { force: true });
  }

  palette.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest('[data-anb-panel-id]') : null
    );
    if (!btn) return;
    addItem(btn.getAttribute('data-anb-panel-id') || '');
  });

  palette.addEventListener('dragstart', (e) => {
    const btn = /** @type {HTMLElement | null} */ (
      e.target instanceof Element ? e.target.closest('[data-anb-panel-id]') : null
    );
    if (!btn || !e.dataTransfer) return;
    e.dataTransfer.setData('text/anb-panel-id', btn.getAttribute('data-anb-panel-id') || '');
    e.dataTransfer.effectAllowed = 'copy';
  });
}

function wireCanvasDrop() {
  const canvas = document.getElementById('anb-canvas');
  if (!canvas) return;

  canvas.addEventListener('dragover', (e) => {
    if (e.dataTransfer && [...e.dataTransfer.types].includes('text/anb-panel-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const panelId = e.dataTransfer && e.dataTransfer.getData('text/anb-panel-id');
    if (!panelId || !PANEL_META[panelId]) return;
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const cellW = rect.width / GRID_COLS;
    const cellH = rect.height / GRID_ROWS;
    const x = Math.floor(localX / cellW);
    const y = Math.floor(localY / cellH);
    addItem(panelId, {
      preferX: x,
      preferY: y,
      w: DEFAULT_TILE_W,
      h: DEFAULT_TILE_H,
    });
  });
}

function wireEditorChrome() {
  const gridEl = document.getElementById('anb-grid');
  if (gridEl) {
    /** @param {Event} e */
function onPanelAction(e: Event) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const actionBtn = target.closest('[data-anb-action]');
      if (!(actionBtn instanceof HTMLElement)) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      const item = actionBtn.closest('.grid-stack-item');
      if (!(item instanceof HTMLElement)) return;
      const action = actionBtn.getAttribute('data-anb-action');
      selectItem(item);
      if (action === 'copy') copyItem(item);
      if (action === 'delete') deleteItem(item);
    }
    /* pointerdown beats GridStack drag start */
    gridEl.addEventListener('pointerdown', onPanelAction, true);
    gridEl.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-anb-action]')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const hit = target.closest('.grid-stack-item');
      if (hit instanceof HTMLElement && gridEl.contains(hit)) selectItem(hit);
    });
  }

  const canvas = document.getElementById('anb-canvas');
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      if (e.target instanceof Element && e.target.closest('.grid-stack-item')) return;
      clearSelection();
    });
  }

  document.getElementById('anb-btn-reset')?.addEventListener('click', resetToDefault);
  document.getElementById('anb-btn-clear')?.addEventListener('click', clearAll);
  document.getElementById('anb-btn-copy')?.addEventListener('click', () => {
    if (selectedEl) copyItem(selectedEl);
  });
  document.getElementById('anb-btn-delete')?.addEventListener('click', () => {
    if (selectedEl) deleteItem(selectedEl);
  });

  document.getElementById('anb-term-copy')?.addEventListener('click', () => {
    void copyConfigJson();
  });
  document.getElementById('anb-term-download')?.addEventListener('click', downloadConfigJson);
  document.getElementById('anb-term-reset')?.addEventListener('click', resetToDefault);

  document.addEventListener('keydown', (e) => {
    if (!selectedEl) return;
    const t = e.target;
    if (t instanceof HTMLElement) {
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (t.isContentEditable) return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteItem(selectedEl);
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === 'c' || e.key === 'C' || e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      copyItem(selectedEl);
    }
  });
}

function initGrid() {
  const GridStackCtor = globalThis.GridStack;
  if (!GridStackCtor) {
    console.error('GridStack missing');
    return;
  }
  const canvas = document.getElementById('anb-canvas');
  const displayH = canvas instanceof HTMLElement ? canvasDisplayHeight(canvas) : 0;
  const cellH = displayH > 0 ? displayH / GRID_ROWS : 40;
  grid = GridStackCtor.init(
    {
      column: GRID_COLS,
      row: GRID_ROWS,
      cellHeight: cellH,
      margin: 0,
      float: true,
      animate: true,
      disableOneColumnMode: true,
      minRow: GRID_ROWS,
      maxRow: GRID_ROWS,
      acceptWidgets: false,
      alwaysShowResizeHandle: true,
      resizable: {
        handles: 'e,se,s,w,n,sw,ne,nw',
        autoHide: false,
      },
      draggable: {
        scroll: true,
        cancel: '.anb-panel__action,.anb-panel__actions,input,textarea,button',
      },
    },
    '#anb-grid',
  );

  grid.on('change', () => {
    syncItemsToState();
  });

  /** Live plotBox while dragging resize handles (pixel-level, not only cell snap). */
  let resizeMockRo: ResizeObserver | null = null;
  let resizeMockRaf = 0;
  let resizeMockEl: HTMLElement | null = null;

  function stopLiveResizeMocks() {
    if (resizeMockRo) {
      resizeMockRo.disconnect();
      resizeMockRo = null;
    }
    if (resizeMockRaf) {
      cancelAnimationFrame(resizeMockRaf);
      resizeMockRaf = 0;
    }
    resizeMockEl = null;
  }

  function scheduleLiveResizeMock() {
    if (resizeMockRaf || !resizeMockEl) return;
    resizeMockRaf = requestAnimationFrame(() => {
      resizeMockRaf = 0;
      if (resizeMockEl) fillEditorMocks(resizeMockEl);
    });
  }

  grid.on('resizestart', (_ev, el) => {
    stopLiveResizeMocks();
    if (!(el instanceof HTMLElement)) return;
    resizeMockEl = el;
    if (typeof ResizeObserver === 'undefined') return;
    resizeMockRo = new ResizeObserver(() => scheduleLiveResizeMock());
    resizeMockRo.observe(el);
  });

  grid.on('resizestop', (_ev, el) => {
    stopLiveResizeMocks();
    if (!(el instanceof HTMLElement) || !el.gridstackNode) return;
    const n = el.gridstackNode;
    if ((n.w ?? 1) < 1 || (n.h ?? 1) < 1) {
      grid!.update(el, { w: Math.max(1, n.w ?? 1), h: Math.max(1, n.h ?? 1) });
    }
    fillEditorMocks(el);
  });
}

function init() {
  injectPyramidSsot();
  hydrateControls();
  bindControls();
  wireMessengerTabs();
  wireExportPreviews();
  wireVectorInput();
  applyCanvasMetrics();
  renderPalette();
  wireCanvasDrop();
  wireEditorChrome();
  initGrid();
  loadItems(
    /** @type {ChartItem[]} */ (
      /** @type {{ items: ChartItem[] }} */ (state.base.chart).items
    ),
  );
  setActiveMessenger('telegram');
  scheduleFitEditorScale();
  window.addEventListener('resize', () => {
    scheduleFitEditorScale();
  });
  renderTerminal();
  renderMessengerPreview();
}

init();
