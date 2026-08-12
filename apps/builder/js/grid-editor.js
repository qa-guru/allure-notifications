import { DEFAULT_CARD_GAP, DEFAULT_HEADER_HEIGHT, DEFAULT_TILE_PAD, GRID_COLS, GRID_ROWS, PANEL_META, isKitOnlyPanelId, normalizeChartProfile, resolvePanelMeta, } from '@qa-guru/allure-notifications-config';
import { fillEditorMocks, panelInnerHtml, } from './mocks/kit.js';
import { getPath, resolvePath, setPath, state } from './state.js';
import { renderMessengerPreview } from './app.js';
import { renderTerminal } from './vector-registry.js';
/** Default tile footprint + flush 5-up packing on 10-col grid (2×2, no gutters). */
export const DEFAULT_TILE_W = 2;
export const DEFAULT_TILE_H = 2;
const PACK_COLS = 5;
const PACK_X = Object.freeze([0, 2, 4, 6, 8]);
/** DS `.widget-tile` baseline bar — used to scale title/dots with headerHeight. */
const WT_BAR_BASELINE = 31;
/** DS `.widget-tile` title at baseline bar (rem). */
const WT_TITLE_BASELINE = 0.8125;
/** DS `tokens.css` `--radius-md` @ 1080 canvas baseline — shared with collage export. */
const DS_CARD_RADIUS_MD = 12;
const DS_CARD_RADIUS_CANVAS = 1080;
let grid = null;
let selectedEl = null;
let suppressSync = false;
/** Live plotBox while dragging resize handles (pixel-level, not only cell snap). */
let resizeMockRo = null;
let resizeMockRaf = 0;
let resizeMockEl = null;
function isKitProfile() {
    const chart = /** @type {{ profile?: string }} */ (state.base.chart);
    return normalizeChartProfile(chart.profile) === 'kit';
}
function canAddPalettePanel(panelId) {
    if (!isKitOnlyPanelId(panelId))
        return true;
    return isKitProfile();
}
export function getGrid() {
    return grid;
}
export function setGridForTest(g) {
    grid = g;
}
export function setSuppressSyncForTest(v) {
    suppressSync = v;
}
export function clearResizeMockElForTest() {
    resizeMockEl = null;
}
/**
 * @param {{ width: number, height: number, cardGap?: number, headerHeight?: number, tilePad?: number }} chart
 * @param {ChartItem} item
 */
export function freeCellRect(chart, item) {
    const cardGap = chart.cardGap != null && Number.isFinite(Number(chart.cardGap))
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
 * Jar canvas logical px — scales `--radius-md` with canvas size.
 * 870×1080 → 10px · 1080×1080 → 12px · 1024×1280 → 11px.
 */
function cardCornerRadiusLogical(chartW, chartH) {
    if (!(chartW > 0) || !(chartH > 0)) {
        return DS_CARD_RADIUS_MD;
    }
    const scale = Math.min(chartW, chartH) / DS_CARD_RADIUS_CANVAS;
    return Math.max(8, Math.min(12, Math.round(DS_CARD_RADIUS_MD * scale)));
}
export function chromeCssVars(chart) {
    const headerHeight = chart.headerHeight != null && Number.isFinite(Number(chart.headerHeight))
        ? Math.max(1, Number(chart.headerHeight))
        : DEFAULT_HEADER_HEIGHT;
    const tilePad = chart.tilePad != null && Number.isFinite(Number(chart.tilePad))
        ? Math.max(0, Number(chart.tilePad))
        : DEFAULT_TILE_PAD;
    const chartW = chart.width != null && Number.isFinite(Number(chart.width)) ? Number(chart.width) : 870;
    const chartH = chart.height != null && Number.isFinite(Number(chart.height)) ? Number(chart.height) : 1080;
    const radius = cardCornerRadiusLogical(chartW, chartH);
    const scale = headerHeight / WT_BAR_BASELINE;
    return (`--wt-bar-height:${headerHeight}px;` +
        `--wt-pad:${tilePad}px;` +
        `--wt-title-size:${(WT_TITLE_BASELINE * scale).toFixed(4)}rem;` +
        `--indicator-size:${Math.max(6, Math.round(10 * scale))}px;` +
        `--wt-dot-gap:${Math.max(2, Math.round(5 * scale))}px;` +
        `--anb-card-radius:${radius}px`);
}
/**
 * Display scale of the editor canvas vs logical chart width.
 * Preview applies the same ratio via `transform: scale` on the stage —
 * editor chrome (cardGap / headerHeight / tilePad) must use CSS px × this.
 * @param {HTMLElement} canvas
 */
export function canvasDisplayScale(canvas) {
    const chart = /** @type {{ width: number }} */ (state.base.chart);
    const displayW = canvas.getBoundingClientRect().width;
    if (!(displayW > 0) || !(chart.width > 0))
        return 1;
    return displayW / chart.width;
}
/**
 * Logical canvas px → displayed height from shell width (GridStack must not pin old height).
 * @param {HTMLElement} canvas
 */
export function canvasDisplayHeight(canvas) {
    const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
    const displayW = canvas.getBoundingClientRect().width;
    if (!(displayW > 0) || !(chart.width > 0))
        return 0;
    return (displayW * chart.height) / chart.width;
}
/** Resolve `base.chart.cardGap` (px, logical canvas). */
function resolveCardGap() {
    const chart = /** @type {{ cardGap?: number }} */ (state.base.chart);
    return chart.cardGap != null && Number.isFinite(Number(chart.cardGap))
        ? Math.max(0, Number(chart.cardGap))
        : DEFAULT_CARD_GAP;
}
/**
 * Push config/DS chrome knobs onto the editor canvas (cardGap · headerHeight · tilePad).
 * Values are logical canvas px, converted to CSS px via canvasDisplayScale so
 * gutters/pads match TG preview proportions at any shell width.
 */
export function syncEditorChrome() {
    const chart = /** @type {{ width?: number, height?: number, cardGap?: number, headerHeight?: number, tilePad?: number }} */ (state.base.chart);
    const cardGap = chart.cardGap != null && Number.isFinite(Number(chart.cardGap))
        ? Math.max(0, Number(chart.cardGap))
        : DEFAULT_CARD_GAP;
    const headerHeight = chart.headerHeight != null && Number.isFinite(Number(chart.headerHeight))
        ? Math.max(1, Number(chart.headerHeight))
        : DEFAULT_HEADER_HEIGHT;
    const tilePad = chart.tilePad != null && Number.isFinite(Number(chart.tilePad))
        ? Math.max(0, Number(chart.tilePad))
        : DEFAULT_TILE_PAD;
    const canvas = document.getElementById('anb-canvas');
    if (!(canvas instanceof HTMLElement))
        return;
    const displayScale = canvasDisplayScale(canvas);
    const gapCss = cardGap * displayScale;
    const barCss = headerHeight * displayScale;
    const padCss = tilePad * displayScale;
    const chartW = chart.width != null && Number.isFinite(Number(chart.width)) ? Number(chart.width) : 870;
    const chartH = chart.height != null && Number.isFinite(Number(chart.height)) ? Number(chart.height) : 1080;
    const logicalR = cardCornerRadiusLogical(chartW, chartH);
    // Scale with preview, clamp so corners stay visible but never pill-like on small tiles.
    const radiusCss = Math.max(5, Math.min(10, Math.round(logicalR * displayScale)));
    canvas.style.setProperty('--anb-card-gap', `${gapCss}px`);
    canvas.style.setProperty('--anb-bar-h', `${barCss}px`);
    canvas.style.setProperty('--anb-title-size', `${(WT_TITLE_BASELINE * barCss / WT_BAR_BASELINE).toFixed(4)}rem`);
    canvas.style.setProperty('--wt-pad', `${padCss}px`);
    canvas.style.setProperty('--anb-resize-size', `${Math.max(8, 14 * displayScale)}px`);
    canvas.style.setProperty('--anb-card-radius', `${radiusCss}px`);
}
/**
 * Sync GridStack cellHeight to the inset grid box (canvas minus scaled cardGap).
 * CSS: grid `inset: half-gap` + content `inset: half-gap` → edge = between = cardGap.
 * cardGap is logical canvas px × displayScale (same visual ratio as TG preview).
 */
export function fitEditorScale() {
    const canvas = document.getElementById('anb-canvas');
    const gridEl = document.getElementById('anb-grid');
    if (!canvas || !grid)
        return;
    const displayH = canvasDisplayHeight(canvas);
    if (!(displayH > 0))
        return;
    const gapPx = resolveCardGap() * canvasDisplayScale(canvas);
    const gridH = Math.max(1, displayH - gapPx);
    const cellH = gridH / GRID_ROWS;
    grid.cellHeight(cellH);
    /* Height comes from absolute inset — clear any legacy inline size. */
    if (gridEl instanceof HTMLElement) {
        gridEl.style.height = '';
        gridEl.style.width = '';
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
export function setGridAnimate(on) {
    if (!grid)
        return;
    if (typeof grid.setAnimation === 'function')
        grid.setAnimation(on);
    else if (grid.opts)
        grid.opts.animate = on;
    const gridEl = document.getElementById('anb-grid');
    if (gridEl)
        gridEl.classList.toggle('grid-stack-animate', on);
}
/**
 * Fit cellHeight (no animate), flush layout, paint mocks once — same path for
 * every chart. No hide/settle/ResizeObserver hacks.
 */
export function fitAndFillEditor() {
    if (!grid)
        return;
    setGridAnimate(false);
    syncEditorChrome();
    fitEditorScale();
    const gridEl = document.getElementById('anb-grid');
    if (gridEl)
        void gridEl.offsetHeight;
    fillEditorMocks();
    setGridAnimate(true);
}
export function scheduleFitEditorScale() {
    requestAnimationFrame(fitAndFillEditor);
}
/**
 * @param {ChartItem} a
 * @param {ChartItem} b
 */
export function rectsOverlap(a, b) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}
/**
 * @param {Partial<ChartItem> & { type: string, id?: string }} raw
 * @returns {ChartItem | null}
 */
export function clampItem(raw) {
    const meta = resolvePanelMeta(raw);
    if (!meta)
        return null;
    const w = Math.max(1, Math.min(GRID_COLS, Math.round(raw.w ?? meta.defaultW)));
    const h = Math.max(1, Math.min(GRID_ROWS, Math.round(raw.h ?? meta.defaultH)));
    const x = Math.max(0, Math.min(GRID_COLS - w, Math.round(raw.x ?? 0)));
    const y = Math.max(0, Math.min(GRID_ROWS - h, Math.round(raw.y ?? 0)));
    const item = { type: meta.type, x, y, w, h };
    if (isKitOnlyPanelId(meta.id))
        item.id = meta.id;
    if (meta.groupBy)
        item.groupBy = meta.groupBy;
    if (meta.by)
        item.by = meta.by;
    return item;
}
/** @returns {ChartItem[]} */
export function readItemsFromGrid() {
    if (!grid)
        return [];
    return (grid.engine?.nodes ?? [])
        .map((node) => {
        const el = /** @type {HTMLElement | undefined} */ (node.el);
        const type = el?.dataset?.type || /** @type {{ type?: string }} */ (node).type;
        if (!type)
            return null;
        const inner = el?.querySelector('.widget-tile[data-group-by], .widget-tile[data-by]');
        const panelId = el?.dataset?.panelId || undefined;
        return clampItem({
            type,
            id: panelId,
            groupBy: el?.dataset?.groupBy ||
                (inner instanceof HTMLElement ? inner.getAttribute('data-group-by') : undefined) ||
                undefined,
            by: el?.dataset?.by ||
                (inner instanceof HTMLElement ? inner.getAttribute('data-by') : undefined) ||
                undefined,
            x: node.x ?? 0,
            y: node.y ?? 0,
            w: node.w ?? 1,
            h: node.h ?? 1,
        });
    })
        .filter((item) => item != null);
}
export function syncItemsToState() {
    if (suppressSync)
        return;
    const chart = /** @type {{ layout: string, items: ChartItem[], gridCols: number, gridRows: number }} */ (state.base.chart);
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
export function updateEmptyState() {
    const empty = document.getElementById('anb-empty');
    if (!empty)
        return;
    empty.hidden = readItemsFromGrid().length > 0;
}
export function updateToolbar() {
    const delBtn = document.getElementById('anb-btn-delete');
    const chartOn = Boolean(getPath('base.enableChart'));
    const on = chartOn && Boolean(selectedEl);
    if (delBtn instanceof HTMLButtonElement)
        delBtn.disabled = !on;
}
/**
 * @param {HTMLElement | null} el
 */
export function getSelectedEl() {
    return selectedEl;
}
export function selectItem(el) {
    if (selectedEl)
        selectedEl.classList.remove('is-selected');
    selectedEl = el;
    if (selectedEl)
        selectedEl.classList.add('is-selected');
    updateToolbar();
}
export function clearSelection() {
    selectItem(null);
}
/**
 * @param {ChartItem} item
 */
export function makeWidgetEl(item) {
    const el = document.createElement('div');
    el.className = 'grid-stack-item';
    el.dataset.type = item.type;
    if (item.id)
        el.dataset.panelId = item.id;
    if (item.groupBy)
        el.dataset.groupBy = item.groupBy;
    if (item.by)
        el.dataset.by = item.by;
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
export function findFreeSpot(w, h, preferX, preferY) {
    const occupied = readItemsFromGrid();
    /** @param {number} x @param {number} y */
    function overlaps(x, y) {
        return occupied.some((p) => rectsOverlap({ type: '_', x, y, w, h }, p));
    }
    /** @param {number} x @param {number} y */
    function fits(x, y) {
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
                if (fits(x, y))
                    return { x, y };
            }
        }
    }
    for (let y = 0; y <= GRID_ROWS - h; y += 1) {
        for (let x = 0; x <= GRID_COLS - w; x += 1) {
            if (fits(x, y))
                return { x, y };
        }
    }
    return null;
}
/**
 * @param {string} panelId catalog id (or ChartType alias for CB-870 types)
 * @param {{ w?: number, h?: number, x?: number, y?: number, preferX?: number, preferY?: number }} [opts]
 */
export function addItem(panelId, opts = {}) {
    const meta = PANEL_META[panelId] || resolvePanelMeta({ type: panelId });
    if (!meta || !grid)
        return;
    if (!canAddPalettePanel(meta.id))
        return;
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
    // meta already resolved — clampItem cannot return null for a catalog type.
    const item = clampItem({
        type: meta.type,
        id: meta.id,
        groupBy: meta.groupBy,
        by: meta.by,
        x: spot.x,
        y: spot.y,
        w,
        h,
    });
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
export function copyItem(el) {
    const node = el.gridstackNode;
    if (!node)
        return;
    const type = el.dataset.type;
    if (!type)
        return;
    const meta = resolvePanelMeta({
        type,
        groupBy: el.dataset.groupBy || undefined,
        by: el.dataset.by || undefined,
    });
    if (!meta)
        return;
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
export function deleteItem(el) {
    if (!grid || !el)
        return;
    if (selectedEl === el)
        clearSelection();
    grid.removeWidget(el, true, true);
    syncItemsToState();
}
/**
 * @param {ChartItem[]} items
 */
export function loadItems(items) {
    if (!grid)
        return;
    suppressSync = true;
    setGridAnimate(false);
    fitEditorScale();
    grid.removeAll(true);
    clearSelection();
    items.forEach((raw) => {
        const item = clampItem(raw);
        if (!item)
            return;
        const el = makeWidgetEl(item);
        grid.makeWidget(el);
        if (el.gridstackNode) {
            /** @type {{ type?: string }} */ (el.gridstackNode).type = item.type;
            el.gridstackNode.minW = 1;
            el.gridstackNode.minH = 1;
        }
    });
    const gridEl = document.getElementById('anb-grid');
    if (gridEl)
        void gridEl.offsetHeight;
    fillEditorMocks();
    setGridAnimate(true);
    suppressSync = false;
    syncItemsToState();
}
export function clearAll() {
    if (!grid)
        return;
    suppressSync = true;
    grid.removeAll(true);
    clearSelection();
    suppressSync = false;
    syncItemsToState();
}
export function stopLiveResizeMocks() {
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
export function scheduleLiveResizeMock() {
    if (resizeMockRaf || !resizeMockEl)
        return;
    resizeMockRaf = requestAnimationFrame(() => {
        resizeMockRaf = 0;
        if (resizeMockEl)
            fillEditorMocks(resizeMockEl);
    });
}
export function onGridResizeStart(_ev, el) {
    stopLiveResizeMocks();
    if (!(el instanceof HTMLElement))
        return;
    resizeMockEl = el;
    if (typeof ResizeObserver === 'undefined')
        return;
    resizeMockRo = new ResizeObserver(() => scheduleLiveResizeMock());
    resizeMockRo.observe(el);
}
export function onGridResizeStop(_ev, el) {
    stopLiveResizeMocks();
    if (!(el instanceof HTMLElement) || !el.gridstackNode)
        return;
    const n = el.gridstackNode;
    if ((n.w ?? 1) < 1 || (n.h ?? 1) < 1) {
        grid.update(el, { w: Math.max(1, n.w ?? 1), h: Math.max(1, n.h ?? 1) });
    }
    fillEditorMocks(el);
}
export function onGridChange() {
    syncItemsToState();
}
export function initGrid() {
    const GridStackCtor = globalThis.GridStack;
    if (!GridStackCtor) {
        console.error('GridStack missing');
        return;
    }
    const canvas = document.getElementById('anb-canvas');
    const displayH = canvas instanceof HTMLElement ? canvasDisplayHeight(canvas) : 0;
    const gapPx = canvas instanceof HTMLElement
        ? resolveCardGap() * canvasDisplayScale(canvas)
        : resolveCardGap();
    const cellH = displayH > 0 ? Math.max(1, displayH - gapPx) / GRID_ROWS : 40;
    grid = GridStackCtor.init({
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
    }, '#anb-grid');
    if (!grid)
        return;
    grid.on('change', onGridChange);
    grid.on('resizestart', onGridResizeStart);
    grid.on('resizestop', onGridResizeStop);
}
export function migrateChromeKnobs() {
    const chart = /** @type {{ headerHeight?: number }} */ (state.base.chart);
    if (!chart)
        return;
    const h = Number(chart.headerHeight);
    if (!Number.isFinite(h) || h <= 0)
        return;
    if (h < WT_BAR_BASELINE) {
        chart.headerHeight = WT_BAR_BASELINE;
    }
}
export { fillEditorMocks };
