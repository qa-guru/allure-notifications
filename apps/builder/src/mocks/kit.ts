import {
  GRID_COLS,
  isKitOnlyPanelId,
  isKitOnlyPanelType,
  resolvePanelMeta,
  type ChartItem,
  type PanelMeta,
} from '@qa-guru/allure-notifications-config';
import {
  canvasTestsTableRowsHtml,
  paletteTestsTableRowsHtml,
} from '../tests-table-mock.js';
import { chromeCssVars, freeCellRect } from '../grid-editor.js';
import { state } from '../state.js';
import { escapeHtml } from '../tg-caption.js';

export { canvasTestsTableRowsHtml };

/** Collage parity: `max(1, floor((hostH - theadH) / rowH))` — metrics measured, not hardcoded. */
export function canvasTestsTableMaxRows(hostH: number, headerH: number, rowH: number): number {
  if (!(hostH > 0) || !(rowH > 0)) return 1;
  return Math.max(1, Math.floor((hostH - Math.max(0, headerH)) / rowH));
}

function measureCanvasTestsTableMetrics(host: HTMLElement): { headerH: number; rowH: number } {
  const theadTr = host.querySelector('thead tr');
  const tbody = host.querySelector('tbody');
  const headerH = theadTr ? theadTr.getBoundingClientRect().height : 0;
  let rowEl = tbody?.querySelector('tr') ?? null;
  let probe: HTMLTableRowElement | null = null;
  if (!rowEl && tbody) {
    tbody.innerHTML = canvasTestsTableRowsHtml(1);
    rowEl = tbody.querySelector('tr');
    probe = rowEl;
  }
  const rowH = rowEl ? rowEl.getBoundingClientRect().height : 0;
  if (probe && tbody) {
    /* Probe only for metrics — syncRows replaces with the real slice. */
    tbody.replaceChildren();
  }
  return { headerH, rowH };
}

const canvasTestsTableTeardown = new WeakMap<HTMLElement, () => void>();

function disconnectCanvasTestsTableHost(host: HTMLElement): void {
  canvasTestsTableTeardown.get(host)?.();
  canvasTestsTableTeardown.delete(host);
}

function syncCanvasTestsTableHost(host: HTMLElement): void {
  if (host.classList.contains('anb-kit-mock--palette')) return;
  const tbody = host.querySelector('tbody');
  if (!tbody) return;
  const hostH = host.clientHeight || host.getBoundingClientRect().height;
  const { headerH, rowH } = measureCanvasTestsTableMetrics(host);
  const maxRows = canvasTestsTableMaxRows(hostH, headerH, rowH);
  const prev = tbody.dataset.maxRows;
  const prevCount = tbody.querySelectorAll('tr').length;
  if (prev === String(maxRows) && prevCount === maxRows) return;
  tbody.dataset.maxRows = String(maxRows);
  tbody.innerHTML = canvasTestsTableRowsHtml(maxRows);
}

function observeCanvasTestsTableHost(host: HTMLElement): void {
  if (host.classList.contains('anb-kit-mock--palette')) return;
  disconnectCanvasTestsTableHost(host);
  syncCanvasTestsTableHost(host);
  if (typeof ResizeObserver === 'undefined') return;
  let frame = 0;
  const observer = new ResizeObserver(() => {
    if (!host.isConnected) {
      disconnectCanvasTestsTableHost(host);
      return;
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      syncCanvasTestsTableHost(host);
    });
  });
  observer.observe(host);
  canvasTestsTableTeardown.set(host, () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
  });
}

/** Wire height-fill row sync for canvas / TG kit tests-table mocks (not palette). */
export function syncCanvasTestsTables(root?: ParentNode | null): void {
  const scope: ParentNode = root || document;
  const nodes = scope.querySelectorAll(
    '.anb-kit-mock.tests-table-panel:not(.anb-kit-mock--palette)',
  );
  nodes.forEach((node) => {
    if (node instanceof HTMLElement) observeCanvasTestsTableHost(node);
  });
}

function paletteQgRulesHtml(rules: Array<{ id: string; formula: string }>) {
  return (
    `<ul class="quality-gate__rules">` +
    rules
      .map(
        (rule) =>
          `<li class="quality-gate__rule">` +
          `<div class="quality-gate__rule-id">${escapeHtml(rule.id)}</div>` +
          `<div class="quality-gate__rule-detail"><p class="quality-gate__formula">${rule.formula}</p></div>` +
          `</li>`,
      )
      .join('') +
    `</ul>`
  );
}

/** Status-family dots — same chrome as chart palette tiles. */
function kitOnlyPaletteBarHtml(panelId: string, chartType: string) {
  let dots: string[];
  if (chartType === 'testsTable') {
    dots = ['green', 'red', 'yellow'];
  } else if (panelId === 'sonarQualityGate') {
    dots = ['red', 'orange', 'green'];
  } else {
    dots = ['green', 'yellow', 'red'];
  }
  return (
    `<div class="indicator-row" aria-hidden="true">` +
    dots.map((d) => `<span class="indicator indicator--status-${d}"></span>`).join('') +
    `</div>`
  );
}

/** Palette thumb body — body-only QG / compact table; bar = widget-tile dots above. */
function kitOnlyPaletteBodyHtml(panelId: string, chartType: string) {
  const testId = `anb-kit-mock-${panelId}`;
  if (chartType === 'testsTable') {
    return (
      `<div class="tests-table-panel anb-kit-mock anb-kit-mock--palette" data-anb-kit-mock="${escapeHtml(panelId)}" data-testid="${testId}">` +
      `<table class="tests-table-panel__table" aria-hidden="true">` +
      `<tbody>` +
      paletteTestsTableRowsHtml() +
      `</tbody></table></div>`
    );
  }
  if (panelId === 'sonarQualityGate') {
    return (
      `<div class="quality-gate quality-gate--sonar quality-gate--failed anb-kit-mock anb-kit-mock--palette" data-anb-kit-mock="${escapeHtml(panelId)}" data-testid="${testId}" role="status" aria-hidden="true">` +
      `<div class="quality-gate__body">` +
      paletteQgRulesHtml([
        { id: 'cov', formula: '72&lt;80' },
        { id: 'bugs', formula: '3&gt;0' },
      ]) +
      `</div></div>`
    );
  }
  return (
    `<div class="quality-gate quality-gate--allure quality-gate--passed anb-kit-mock anb-kit-mock--palette" data-anb-kit-mock="${escapeHtml(panelId)}" data-testid="${testId}" role="status" aria-hidden="true">` +
    `<div class="quality-gate__body">` +
    `<p class="quality-gate__verdict quality-gate__verdict--ok">Passed</p>` +
    `</div></div>`
  );
}

/** QG body content (verdict / compact rules) — readable at palette 2×2. */
function kitOnlyQgBodyInnerHtml(panelId: string) {
  if (panelId === 'sonarQualityGate') {
    return (
      `<div class="quality-gate__body">` +
      paletteQgRulesHtml([
        { id: 'cov', formula: '72&lt;80' },
        { id: 'bugs', formula: '3&gt;0' },
      ]) +
      `</div>`
    );
  }
  return (
    `<div class="quality-gate__body">` +
    `<p class="quality-gate__verdict quality-gate__verdict--ok">Passed</p>` +
    `</div>`
  );
}

/**
 * Kit QG mock: `hybrid` = quality-gate__bar + body (editor);
 * `body` = body only under TG/jar product chrome (`widget-tile__bar` / drawCard).
 * `barTrailingHtml` — editor delete actions inside the bar (same slot as anb-panel__actions).
 */
function kitOnlyQgMockHtml(
  panelId: string,
  chrome: 'hybrid' | 'body',
  barTrailingHtml = '',
) {
  const testId = `anb-kit-mock-${panelId}`;
  const isSonar = panelId === 'sonarQualityGate';
  const kind = isSonar ? 'sonar' : 'allure';
  const status = isSonar ? 'failed' : 'passed';
  const title = isSonar ? 'Sonar Quality Gate' : 'Allure Quality Gate';
  // Collage/editor hybrid bar: title only — no status indicator, no qg-info (LOCKED).
  const bar =
    chrome === 'hybrid'
      ? `<div class="quality-gate__bar">` +
        `<span class="quality-gate__bar-title">${title}</span>` +
        barTrailingHtml +
        `</div>`
      : '';
  return (
    `<div class="quality-gate quality-gate--${kind} quality-gate--${status} anb-kit-mock" data-anb-kit-mock="${escapeHtml(panelId)}" data-testid="${testId}" role="status" aria-hidden="true">` +
    bar +
    kitOnlyQgBodyInnerHtml(panelId) +
    `</div>`
  );
}

/**
 * Builder kit tile mock — DS quality-gate / tests-table-panel; not collage IR.
 * QG chrome: hybrid (quality-gate__bar); editor may pass barTrailingHtml for delete.
 */
export function kitOnlyPanelMockHtml(
  panelId: string,
  chartType: string,
  qgChrome: 'hybrid' | 'body' = 'hybrid',
  barTrailingHtml = '',
) {
  const testId = `anb-kit-mock-${panelId}`;
  if (chartType === 'testsTable') {
    /* tbody filled by syncCanvasTestsTables (height-slice); not a fixed 5. */
    return (
      `<div class="tests-table-panel anb-kit-mock" data-anb-kit-mock="${escapeHtml(panelId)}" data-testid="${testId}">` +
      `<table class="tests-table-panel__table" aria-hidden="true">` +
      `<thead><tr><th>Test</th><th>Status</th><th>Trend</th><th>Stability</th></tr></thead>` +
      `<tbody></tbody></table></div>`
    );
  }
  return kitOnlyQgMockHtml(panelId, qgChrome, barTrailingHtml);
}

/**
 * Content tier for a free-grid footprint — same SSOT for editor + TG preview.
 * @param {ChartItem} item
 */
export function tileTier(item: ChartItem): string {
  return typeof WidgetTileMocks !== 'undefined' && WidgetTileMocks.tierForSpan
    ? WidgetTileMocks.tierForSpan(GRID_COLS, item.w, item.h)
    : 'regular';
}

/**
 * @param {PanelMeta} item
 * @returns {string}
 */
export function paletteItemHtml(item: PanelMeta): string {
  const chartType = item.type;
  const isKit = isKitOnlyPanelType(chartType) && Boolean(item.id);
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (item.groupBy) attrs += ` data-group-by="${escapeHtml(item.groupBy)}"`;
  if (item.by) attrs += ` data-by="${escapeHtml(item.by)}"`;
  const bar = isKit ? kitOnlyPaletteBarHtml(item.id, chartType) : '';
  const body = isKit ? kitOnlyPaletteBodyHtml(item.id, chartType) : '';
  /* Palette thumbs are always 2×2 — caption = title; grid footprints stay on canvas / DEFAULT_ITEMS. */
  return (
    `<button type="button" class="anb-palette__item" data-anb-panel-id="${escapeHtml(item.id)}" ` +
    `data-testid="anb-palette-${escapeHtml(item.id)}" draggable="true" title="${escapeHtml(item.title)}">` +
    `<div class="widget-tile widget-tile--tier-micro widget-tile--span-2x2 anb-palette__tile" ${attrs}>` +
    `<div class="widget-tile__bar">${bar}</div>` +
    `<div class="widget-tile__body">${body}</div>` +
    `</div>` +
    `<span class="anb-palette__hint">${escapeHtml(item.title)}</span>` +
    `</button>`
  );
}

/**
 * Editor card: non-QG → anb-panel__bar (title + delete) + tiered body.
 * Product dots live only on TG preview / export stage — not on the grid.
 * Kit QG: hybrid quality-gate__bar (no anb-panel__bar); delete inside bar.
 * @param {ChartItem} item
 */
export function panelInnerHtml(item: ChartItem) {
  const meta = resolvePanelMeta(item);
  const title = meta ? meta.title : item.type;
  const chartType = item.type;
  const panelId = item.id || meta?.id || '';
  const tier = tileTier(item);
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (panelId) attrs += ` data-panel-id="${escapeHtml(panelId)}"`;
  if (item.groupBy) attrs += ` data-group-by="${escapeHtml(item.groupBy)}"`;
  else if (meta?.groupBy) attrs += ` data-group-by="${escapeHtml(meta.groupBy)}"`;
  if (item.by) attrs += ` data-by="${escapeHtml(item.by)}"`;
  else if (meta?.by) attrs += ` data-by="${escapeHtml(meta.by)}"`;

  const deleteBtn =
    `<button type="button" class="anb-panel__action" data-anb-action="delete" title="Delete" aria-label="Delete">` +
    `<svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>` +
    `</button>`;

  // QG owns hybrid chrome — LOCKED 2026-08-10 (CANON § Quality-gate chrome).
  // Do not wrap in anb-panel__bar. Delete lives inside quality-gate__bar
  // (same flex slot as anb-panel__actions) — not an absolute overlay.
  if (chartType === 'qualityGate' && panelId) {
    const deleteActions = `<span class="anb-panel__actions">${deleteBtn}</span>`;
    const hybrid = kitOnlyPanelMockHtml(panelId, chartType, 'hybrid', deleteActions);
    return (
      `<div class="anb-panel__body anb-panel__body--qg-hybrid">` +
      `<div class="widget-tile widget-tile--tier-${tier} anb-panel__tile widget-tile--quality-gate" ${attrs}>` +
      `<div class="widget-tile__body">${hybrid}</div>` +
      `</div>` +
      `</div>`
    );
  }

  const kitBody =
    isKitOnlyPanelType(chartType) && panelId
      ? kitOnlyPanelMockHtml(panelId, chartType, 'hybrid')
      : '';
  return (
    `<div class="anb-panel__bar">` +
    `<span class="anb-panel__title">${escapeHtml(title)}</span>` +
    `<span class="anb-panel__actions">${deleteBtn}</span>` +
    `</div>` +
    `<div class="anb-panel__body">` +
    `<div class="widget-tile widget-tile--tier-${tier} anb-panel__tile" ${attrs}>` +
    `<div class="widget-tile__body">${kitBody}</div>` +
    `</div>` +
    `</div>`
  );
}

/**
 * Mini-render of free-layout items into TG photo stage (logical canvas px → scale).
 * Uses DS widget-tile + WidgetTileMocks (not anb-tg__tile placeholder).
 * Chrome: headerHeight → `--wt-bar-height` (+ proportional title/dots);
 * cardGap → jar free-grid half-gap inset; tilePad → `--wt-pad`;
 * tier → `widget-tile--tier-*` (parity with editor `panelInnerHtml`).
 * Kit QG: body-only under product `widget-tile__bar` (macOS dots + title) —
 * same chrome as other TG tiles. Editor keeps hybrid `quality-gate__bar`.
 * @param {ChartItem} item
 */
export function previewItemHtml(item: ChartItem) {
  const chart = /** @type {{ width: number, height: number, headerHeight?: number, cardGap?: number, tilePad?: number }} */ (
    state.base.chart
  );
  const rect = freeCellRect(chart, item);
  const meta = resolvePanelMeta(item);
  const title = meta ? meta.title : item.type;
  const chartType = item.type;
  const groupBy = item.groupBy || meta?.groupBy || '';
  const by = item.by || meta?.by || '';
  const panelId = item.id || meta?.id || '';
  const tier = tileTier(item);
  let attrs = `data-chart="${escapeHtml(chartType)}"`;
  if (panelId) attrs += ` data-panel-id="${escapeHtml(panelId)}"`;
  if (groupBy) attrs += ` data-group-by="${escapeHtml(groupBy)}"`;
  if (by) attrs += ` data-by="${escapeHtml(by)}"`;
  const chrome = chromeCssVars(chart);
  const isQg = chartType === 'qualityGate';
  const body =
    isKitOnlyPanelType(chartType) && panelId
      ? kitOnlyPanelMockHtml(panelId, chartType, isQg ? 'body' : 'hybrid')
      : '';
  const kitTileMod = isQg ? ' widget-tile--quality-gate' : '';
  const productBar =
    `<div class="widget-tile__bar">` +
    `<span class="widget-tile__title">${escapeHtml(title)}</span>` +
    `</div>`;
  return (
    `<figure class="widget-tile widget-tile--tier-${tier} anb-tg__widget${kitTileMod}" ${attrs} ` +
    `style="left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;${chrome}">` +
    productBar +
    `<div class="widget-tile__body">${body}</div>` +
    `</figure>`
  );
}

/**
 * @param {ParentNode | null} [root]
 */
export function fillEditorMocks(root?: ParentNode | null): void {
  const scope = root || document.getElementById('anb-grid');
  if (!scope) return;
  if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
    window.WidgetTileMocks.fill(scope, { force: true });
  }
  syncCanvasTestsTables(scope);
}
