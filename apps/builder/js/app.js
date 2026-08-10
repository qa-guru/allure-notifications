import { CANVAS_PRESETS, DEFAULT_CANVAS, GRID_COLS, GRID_ROWS, PANEL_CATALOG, PANEL_META, isKitOnlyPanelId, normalizeChartProfile, } from '@qa-guru/allure-notifications-config';
import { CORNER_RATIO, PYRAMID_COLORS_DARK, PYRAMID_COLORS_LIGHT, STATUS_COLORS, TIER_GAP_RATIO, } from '@qa-guru/allure-notifications-pyramid';
import { DEFAULT_TILE_H, DEFAULT_TILE_W, addItem, clearAll, clearSelection, clearResizeMockElForTest, copyItem, deleteItem, fillEditorMocks, fitAndFillEditor, fitEditorScale, getGrid, getSelectedEl, initGrid, loadItems, migrateChromeKnobs, onGridChange, onGridResizeStart, onGridResizeStop, readItemsFromGrid, scheduleFitEditorScale, scheduleLiveResizeMock, selectItem, setGridAnimate, setGridForTest, setSuppressSyncForTest, stopLiveResizeMocks, syncEditorChrome, updateEmptyState, updateToolbar, canvasDisplayHeight, canvasDisplayScale, chromeCssVars, clampItem, findFreeSpot, freeCellRect, makeWidgetEl, rectsOverlap, } from './grid-editor.js';
import { canvasTestsTableMaxRows, canvasTestsTableRowsHtml, kitOnlyPanelMockHtml, paletteItemHtml, panelInnerHtml, previewItemHtml, syncCanvasTestsTables, tileTier, } from './mocks/kit.js';
import { controlValue, createDefaultState, getPath, resolvePath, setPath, state } from './state.js';
import { TG_BOT_NAME, buildTgCaptionHtml, escapeHtml, formatDurationMs, formatPercentage, phrasesFor, setTgPreviewStatsForTest, } from './tg-caption.js';
import { DEFAULT_VECTOR_ID, VECTOR_REGISTRY_KEY, VECTOR_REGISTRY_KEY_LEGACY, capsSnap, cloneSnap, configJsonText, fingerprint, fingerprintFromSnap, loadVectorRegistry, normalizeVectorId, rememberSnap, renderTerminal, renderVectorInput, setVectorDraft, setVectorMiss, vectorHash, vectorRegistry, } from './vector-registry.js';
/**
 * apps/builder — TypeScript source (emit → `js/` for Pages / stand).
 * Theme:
 *   - Header moon (`html.theme-light`) → entire page; syncs jar `base.darkMode`
 *     so collage is not an exception.
 *   - Options `base.darkMode` → preview grid panel only (`[data-anb-dark]` on
 *     panel header + canvas + caption / export) — does not repaint page chrome.
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
 * Catalog / presets from `@qa-guru/allure-notifications-config`; pyramid geometry +
 * layer palette from `@qa-guru/allure-notifications-pyramid` (import map → vendor sync).
 * UI-only packing stays local.
 */
/** TG feed bubble width (CSS px) — not export SSOT. */
const TG_FEED_PREVIEW_WIDTH = 480;
let openExportMode = null;
let openExportTrigger = null;
function canvasKeyFromState() {
    const chart = /** @type {{ width: number, height: number }} */ (state.base.chart);
    const key = `${chart.width}x${chart.height}`;
    return Object.prototype.hasOwnProperty.call(CANVAS_PRESETS, key) ? key : DEFAULT_CANVAS;
}
function chartProfile() {
    const chart = /** @type {{ profile?: string }} */ (state.base.chart);
    return normalizeChartProfile(chart.profile);
}
function isKitProfile() {
    return chartProfile() === 'kit';
}
/** Palette slots — kit-only QG visible only when profile=kit. */
function paletteCatalog() {
    if (isKitProfile())
        return [...PANEL_CATALOG];
    return PANEL_CATALOG.filter((p) => !isKitOnlyPanelId(p.id));
}
function canAddPalettePanel(panelId) {
    if (!isKitOnlyPanelId(panelId))
        return true;
    return isKitProfile();
}
/**
 * @param {string} key
 */
function applyCanvasPreset(key) {
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
    syncEditorChrome();
}
/**
 * Drive `--layer-*` + geometry ratios from `@pyramid` (SSOT over DS token pin).
 * Collage / preview panel follow `[data-anb-dark]`; page chrome follows
 * `html.theme-light` (Options · terminal · shell).
 */
function injectPyramidSsot() {
    const id = 'anb-pyramid-ssot';
    let style = document.getElementById(id);
    if (!(style instanceof HTMLStyleElement)) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }
    const layerBlock = (colors) => Object.entries(colors)
        .map(([layer, hex]) => `  --layer-${layer}: ${hex};`)
        .join('\n');
    const collageDark = '.anb-canvas[data-anb-dark="true"], ' +
        '.anb-export-popover__viewport[data-anb-dark="true"], ' +
        '.anb-export-popover__stage[data-anb-dark="true"], ' +
        '.anb-messenger-pane[data-anb-dark="true"]';
    const collageLight = '.anb-canvas[data-anb-dark="false"], ' +
        '.anb-export-popover__viewport[data-anb-dark="false"], ' +
        '.anb-export-popover__stage[data-anb-dark="false"], ' +
        '.anb-messenger-pane[data-anb-dark="false"]';
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
        `${collageDark} {`,
        layerBlock(PYRAMID_COLORS_DARK),
        '}',
        `${collageLight} {`,
        layerBlock(PYRAMID_COLORS_LIGHT),
        '}',
    ].join('\n');
}
/**
 * Header moon toggles `html.theme-light` (header.js) and also writes
 * `base.darkMode` so the collage/preview panel follows — whole page, no exceptions.
 * Options seg is one-way the other direction: jar flag → `[data-anb-dark]` only.
 */
function wireHeaderThemeDarkModeSync() {
    const syncFromPageTheme = () => {
        const darkMode = !document.documentElement.classList.contains('theme-light');
        if (Boolean(getPath('base.darkMode')) === darkMode)
            return;
        setPath('base.darkMode', darkMode);
        const field = document.querySelector('[data-anb-bool="base.darkMode"]');
        if (field instanceof HTMLElement)
            syncBoolSeg(field, darkMode);
        applyChartFlags();
        renderTerminal();
    };
    new MutationObserver(syncFromPageTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
}
/**
 * Apply a caps snap to controls + grid. Grid footprints always come from
 * `snap.base.chart.items` (vector state) — never from palette catalog defaults.
 * @param {Record<string, unknown>} snap
 */
function applySnap(snap) {
    const next = cloneSnap(snap);
    state.base = /** @type {Record<string, unknown>} */ (next.base);
    state.telegram = /** @type {Record<string, unknown>} */ (next.telegram);
    setPath('base.chart.profile', normalizeChartProfile(
    /** @type {{ profile?: string }} */ (state.base.chart)?.profile));
    migrateChromeKnobs();
    const chartState = /** @type {{ items?: ChartItem[] }} */ (state.base.chart);
    setVectorDraft(null);
    setVectorMiss(false);
    rememberSnap(capsSnap());
    hydrateControls();
    applyCanvasMetrics();
    loadItems(Array.isArray(chartState.items) ? chartState.items.map((p) => ({ ...p })) : []);
    scheduleFitEditorScale();
    renderTerminal();
    renderMessengerPreview();
    renderVectorInput();
}
/** First paint / Reset — default vector = `createDefaultConfig` (DEFAULT_ITEMS on CB-870). */
function applyDefaultVector() {
    applySnap(createDefaultState());
}
/**
 * @param {string} raw
 */
function commitVector(raw) {
    const vectorId = fingerprint();
    const normalized = normalizeVectorId(raw);
    setVectorDraft(null);
    if (!normalized || normalized === vectorId) {
        setVectorMiss(false);
        renderVectorInput();
        return;
    }
    if (normalized === DEFAULT_VECTOR_ID) {
        applyDefaultVector();
        return;
    }
    const snap = vectorRegistry.get(normalized);
    if (!snap) {
        setVectorMiss(true);
        renderVectorInput();
        return;
    }
    applySnap(snap);
}
function wireVectorInput() {
    const input = document.getElementById('anb-term-vector');
    if (!(input instanceof HTMLInputElement))
        return;
    input.addEventListener('input', () => {
        setVectorDraft(input.value);
        setVectorMiss(false);
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
            setVectorDraft(null);
            setVectorMiss(false);
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
    }
    catch {
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
 * @param {HTMLElement} stage
 * @param {'tg' | 'full'} mode
 */
function renderCollageStage(stage, mode) {
    const chart = /** @type {{ width: number, height: number, items: ChartItem[] }} */ (state.base.chart);
    const items = Array.isArray(chart.items) ? chart.items : [];
    stage.innerHTML = items.map(previewItemHtml).join('');
    stage.style.width = `${chart.width}px`;
    stage.style.height = `${chart.height}px`;
    if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
        window.WidgetTileMocks.fill(stage, { force: true });
    }
    syncCanvasTestsTables(stage);
    const popover = document.getElementById('anb-export-popover');
    let scale = 1;
    if (mode === 'tg') {
        scale = TG_FEED_PREVIEW_WIDTH / chart.width;
    }
    else {
        // Keep in sync with .anb-export-popover max-width/max-height.
        const maxBoxW = Math.min(window.innerWidth * 0.98, 1460);
        const maxBoxH = Math.min(window.innerHeight * 0.96, 1160);
        scale = Math.min(1, maxBoxW / chart.width, maxBoxH / chart.height);
    }
    stage.style.transform = scale === 1 ? 'none' : `scale(${scale})`;
    const displayW = Math.round(chart.width * scale);
    const displayH = Math.round(chart.height * scale);
    if (popover instanceof HTMLElement) {
        popover.style.width = `${displayW}px`;
        popover.style.height = `${displayH}px`;
    }
}
/**
 * @param {'tg' | 'full'} mode
 * @param {HTMLElement} anchor
 */
function showExportPopover(mode, anchor) {
    const popover = document.getElementById('anb-export-popover');
    const stage = document.getElementById('anb-export-popover-stage');
    if (!(popover instanceof HTMLElement) || !(stage instanceof HTMLElement))
        return;
    openExportMode = mode;
    openExportTrigger = anchor;
    document.querySelectorAll('.anb-export-trigger').forEach((btn) => {
        btn.classList.toggle('is-open', btn === anchor);
    });
    renderCollageStage(stage, mode);
    popover.hidden = false;
    requestAnimationFrame(() => {
        if (!(anchor instanceof HTMLElement))
            return;
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
    if (popover instanceof HTMLElement)
        popover.hidden = true;
    openExportMode = null;
    openExportTrigger = null;
    document.querySelectorAll('.anb-export-trigger').forEach((btn) => {
        btn.classList.remove('is-open');
    });
}
function refreshExportPopoverIfOpen() {
    if (!openExportMode || !openExportTrigger)
        return;
    const stage = document.getElementById('anb-export-popover-stage');
    if (!(stage instanceof HTMLElement))
        return;
    renderCollageStage(stage, openExportMode);
    showExportPopover(openExportMode, openExportTrigger);
}
function wireExportPreviews() {
    const group = document.querySelector('[data-testid="anb-export-links"]');
    if (!(group instanceof HTMLElement))
        return;
    /** @param {'tg' | 'full'} mode @param {HTMLElement} trigger */
    function open(mode, trigger) {
        if (openExportMode === mode && openExportTrigger === trigger) {
            hideExportPopover();
            return;
        }
        showExportPopover(mode, trigger);
    }
    group.querySelectorAll('[data-anb-export]').forEach((btn) => {
        if (!(btn instanceof HTMLElement))
            return;
        const mode = btn.getAttribute('data-anb-export');
        if (mode !== 'tg' && mode !== 'full')
            return;
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
        // Listener is on `document`; dispatched events always have a Node target.
        const target = e.target;
        if (group.contains(target) || popover?.contains(target))
            return;
        hideExportPopover();
    });
    window.addEventListener('resize', () => {
        refreshExportPopoverIfOpen();
    });
}
export function renderMessengerPreview() {
    const nameEl = document.getElementById('anb-tg-bot-name');
    const textEl = document.getElementById('anb-tg-text');
    if (nameEl)
        nameEl.textContent = TG_BOT_NAME;
    if (textEl)
        textEl.innerHTML = buildTgCaptionHtml();
    refreshExportPopoverIfOpen();
}
/**
 * @param {HTMLElement} root
 * @param {boolean} value
 */
function syncBoolSeg(root, value) {
    const want = value ? 'true' : 'false';
    root.querySelectorAll('.plaque-field-seg__btn').forEach((btn) => {
        const on = btn.getAttribute('data-value') === want;
        btn.classList.toggle('plaque-field-seg__btn--on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}
/**
 * Mirror jar flags onto the preview grid panel only: `base.darkMode` →
 * `[data-anb-dark]` on panel header + canvas + caption / export stage.
 * Does not touch page `html.theme-light` (Options / terminal / shell).
 */
function applyChartFlags() {
    const enableChart = Boolean(getPath('base.enableChart'));
    const darkMode = Boolean(getPath('base.darkMode'));
    const anbDark = darkMode ? 'true' : 'false';
    for (const id of [
        'anb-preview-panel',
        'anb-canvas',
        'anb-export-popover-viewport',
        'anb-export-popover-stage',
        'anb-messenger-telegram',
    ]) {
        const el = document.getElementById(id);
        if (el instanceof HTMLElement) {
            el.dataset.anbDark = anbDark;
        }
    }
    syncEditorChrome();
    const canvas = document.getElementById('anb-canvas');
    if (canvas instanceof HTMLElement) {
        canvas.classList.toggle('anb-canvas--chart-off', !enableChart);
        canvas.setAttribute('aria-disabled', enableChart ? 'false' : 'true');
    }
    const chartGroup = document.querySelector('[data-testid="anb-group-chart"]');
    if (chartGroup instanceof HTMLElement) {
        chartGroup.classList.toggle('is-disabled', !enableChart);
        // querySelectorAll('input, select') already narrows to form controls.
        chartGroup.querySelectorAll('input, select').forEach((el) => {
            el.disabled = !enableChart;
        });
    }
    const palette = document.getElementById('anb-palette');
    if (palette instanceof HTMLElement) {
        palette.classList.toggle('is-disabled', !enableChart);
        palette.setAttribute('aria-disabled', enableChart ? 'false' : 'true');
    }
    const resetBtn = document.getElementById('anb-btn-reset');
    const clearBtn = document.getElementById('anb-btn-clear');
    if (resetBtn instanceof HTMLButtonElement)
        resetBtn.disabled = !enableChart;
    if (clearBtn instanceof HTMLButtonElement)
        clearBtn.disabled = !enableChart;
    fillEditorMocks();
    refreshExportPopoverIfOpen();
    updateToolbar();
}
function hydrateControls() {
    const root = document.getElementById('anb-options');
    if (!root)
        return;
    root.querySelectorAll('[data-anb-path]').forEach((el) => {
        const path = el.getAttribute('data-anb-path');
        if (!path)
            return;
        const value = getPath(path);
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
            el.value = value == null ? '' : String(value);
        }
    });
    root.querySelectorAll('[data-anb-bool]').forEach((el) => {
        if (!(el instanceof HTMLElement))
            return;
        const path = el.getAttribute('data-anb-bool');
        if (!path)
            return;
        syncBoolSeg(el, Boolean(getPath(path)));
    });
    const canvas = root.querySelector('[data-anb-canvas]');
    if (canvas instanceof HTMLSelectElement) {
        canvas.value = canvasKeyFromState();
    }
    const profile = root.querySelector('[data-testid="anb-chart-profile"]');
    if (profile instanceof HTMLSelectElement) {
        profile.value = chartProfile();
    }
    applyChartFlags();
}
function bindControls() {
    const root = document.getElementById('anb-options');
    if (!root)
        return;
    root.addEventListener('input', (event) => {
        const t = event.target;
        if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement))
            return;
        if (t.hasAttribute('data-anb-canvas')) {
            applyCanvasPreset(t.value);
            renderTerminal();
            return;
        }
        const path = t.getAttribute('data-anb-path');
        if (!path)
            return;
        setPath(path, controlValue(t));
        if (path === 'base.chart.profile') {
            onChartProfileChange();
        }
        if (path === 'base.chart.cardGap' ||
            path === 'base.chart.headerHeight' ||
            path === 'base.chart.tilePad') {
            syncEditorChrome();
            if (path === 'base.chart.cardGap')
                fitAndFillEditor();
        }
        renderTerminal();
        renderMessengerPreview();
    });
    root.addEventListener('change', (event) => {
        const t = event.target;
        if (!(t instanceof HTMLInputElement || t instanceof HTMLSelectElement))
            return;
        if (t.hasAttribute('data-anb-canvas')) {
            applyCanvasPreset(t.value);
            renderTerminal();
            return;
        }
        const path = t.getAttribute('data-anb-path');
        if (!path)
            return;
        setPath(path, controlValue(t));
        if (path === 'base.chart.profile') {
            onChartProfileChange();
        }
        if (path === 'base.chart.cardGap' ||
            path === 'base.chart.headerHeight' ||
            path === 'base.chart.tilePad') {
            syncEditorChrome();
            if (path === 'base.chart.cardGap')
                fitAndFillEditor();
        }
        renderTerminal();
        renderMessengerPreview();
    });
    root.addEventListener('click', (event) => {
        const t = event.target;
        if (!(t instanceof Element))
            return;
        const btn = t.closest('.plaque-field-seg__btn');
        if (!(btn instanceof HTMLButtonElement) || !root.contains(btn))
            return;
        const field = btn.closest('[data-anb-bool]');
        if (!(field instanceof HTMLElement))
            return;
        const path = field.getAttribute('data-anb-bool');
        if (!path)
            return;
        const raw = btn.getAttribute('data-value');
        const value = raw === 'true';
        setPath(path, value);
        syncBoolSeg(field, value);
        applyChartFlags();
        renderTerminal();
        renderMessengerPreview();
    });
}
/** Full reset → default vector (CB-870 + DEFAULT_ITEMS). */
function resetToDefault() {
    applyDefaultVector();
}
function renderPaletteItems() {
    const palette = document.getElementById('anb-palette');
    if (!palette)
        return;
    palette.innerHTML = paletteCatalog().map(paletteItemHtml).join('');
    if (typeof window.WidgetTileMocks !== 'undefined' && window.WidgetTileMocks.fill) {
        window.WidgetTileMocks.fill(palette, { force: true });
    }
}
function onChartProfileChange() {
    renderPaletteItems();
}
function renderPalette() {
    renderPaletteItems();
    const palette = document.getElementById('anb-palette');
    if (!palette)
        return;
    palette.addEventListener('click', (e) => {
        const btn = /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest('[data-anb-panel-id]') : null);
        if (!btn)
            return;
        addItem(btn.getAttribute('data-anb-panel-id') || '');
    });
    palette.addEventListener('dragstart', (e) => {
        const btn = /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest('[data-anb-panel-id]') : null);
        if (!btn || !e.dataTransfer)
            return;
        const tile = btn.querySelector('.anb-palette__tile');
        if (tile instanceof HTMLElement) {
            e.dataTransfer.setDragImage(tile, Math.round(tile.offsetWidth / 2), Math.round(tile.offsetHeight / 2));
        }
        btn.classList.add('is-dragging');
        e.dataTransfer.setData('text/anb-panel-id', btn.getAttribute('data-anb-panel-id') || '');
        e.dataTransfer.effectAllowed = 'copy';
    });
    palette.addEventListener('dragend', (e) => {
        const btn = /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest('[data-anb-panel-id]') : null);
        btn?.classList.remove('is-dragging');
    });
}
function wireCanvasDrop() {
    const canvas = document.getElementById('anb-canvas');
    if (!canvas)
        return;
    canvas.addEventListener('dragover', (e) => {
        if (e.dataTransfer && [...e.dataTransfer.types].includes('text/anb-panel-id')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    });
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const panelId = e.dataTransfer && e.dataTransfer.getData('text/anb-panel-id');
        if (!panelId || !PANEL_META[panelId] || !canAddPalettePanel(panelId))
            return;
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
        function onPanelAction(e) {
            const target = e.target;
            if (!(target instanceof Element))
                return;
            const actionBtn = target.closest('[data-anb-action]');
            if (!(actionBtn instanceof HTMLElement))
                return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const item = actionBtn.closest('.grid-stack-item');
            if (!(item instanceof HTMLElement))
                return;
            const action = actionBtn.getAttribute('data-anb-action');
            selectItem(item);
            if (action === 'delete')
                deleteItem(item);
        }
        /* pointerdown beats GridStack drag start */
        gridEl.addEventListener('pointerdown', onPanelAction, true);
        gridEl.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element))
                return;
            if (target.closest('[data-anb-action]')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const hit = target.closest('.grid-stack-item');
            if (hit instanceof HTMLElement && gridEl.contains(hit))
                selectItem(hit);
        });
    }
    const canvas = document.getElementById('anb-canvas');
    if (canvas) {
        canvas.addEventListener('mousedown', (e) => {
            if (e.target instanceof Element && e.target.closest('.grid-stack-item'))
                return;
            clearSelection();
        });
    }
    document.getElementById('anb-btn-reset')?.addEventListener('click', resetToDefault);
    document.getElementById('anb-btn-clear')?.addEventListener('click', clearAll);
    document.getElementById('anb-btn-delete')?.addEventListener('click', () => {
        const selected = getSelectedEl();
        if (selected)
            deleteItem(selected);
    });
    document.getElementById('anb-term-copy')?.addEventListener('click', () => {
        void copyConfigJson();
    });
    document.getElementById('anb-term-download')?.addEventListener('click', downloadConfigJson);
    document.getElementById('anb-term-reset')?.addEventListener('click', resetToDefault);
    document.addEventListener('keydown', (e) => {
        const selectedEl = getSelectedEl();
        if (!selectedEl)
            return;
        const t = e.target;
        if (t instanceof HTMLElement) {
            const tag = t.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
                return;
            if (t.isContentEditable)
                return;
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
function init() {
    injectPyramidSsot();
    bindControls();
    wireHeaderThemeDarkModeSync();
    wireExportPreviews();
    wireVectorInput();
    renderPalette();
    wireCanvasDrop();
    wireEditorChrome();
    initGrid();
    /* Grid layout SSOT = vector state; boot applies the default vector. */
    applyDefaultVector();
    window.addEventListener('resize', () => {
        scheduleFitEditorScale();
    });
}
init();
/**
 * Coverage / e2e seam — same SSOT, callable from Playwright `page.evaluate`.
 * Not a second product surface; used to hit pure helpers + awkward branches.
 */
globalThis.__ANB__ = {
    vectorHash,
    normalizeVectorId,
    cloneSnap,
    fingerprintFromSnap,
    escapeHtml,
    phrasesFor,
    formatDurationMs,
    formatPercentage,
    rectsOverlap,
    clampItem,
    freeCellRect,
    chromeCssVars,
    canvasKeyFromState,
    controlValue,
    resolvePath,
    getPath,
    setPath,
    commitVector,
    findFreeSpot: (w, h, preferX, preferY) => findFreeSpot(w, h, preferX, preferY),
    addItem,
    copyItem,
    deleteItem,
    clearAll,
    resetToDefault,
    chartProfile,
    isKitProfile,
    paletteCatalog,
    canAddPalettePanel,
    onChartProfileChange,
    renderPaletteItems,
    kitOnlyPanelMockHtml,
    canvasTestsTableRowsHtml,
    canvasTestsTableMaxRows,
    syncCanvasTestsTables,
    applyCanvasPreset,
    applySnap,
    loadVectorRegistry,
    initGrid,
    showExportPopover,
    hideExportPopover,
    refreshExportPopoverIfOpen,
    renderCollageStage,
    renderMessengerPreview,
    renderTerminal,
    renderVectorInput,
    applyChartFlags,
    updateToolbar,
    buildTgCaptionHtml,
    readItemsFromGrid,
    loadItems,
    setGridAnimate,
    fitEditorScale,
    canvasDisplayHeight,
    panelInnerHtml,
    previewItemHtml,
    tileTier,
    canvasDisplayScale,
    makeWidgetEl,
    getGrid,
    wireVectorInput,
    bindControls,
    hydrateControls,
    syncEditorChrome,
    wireHeaderThemeDarkModeSync,
    wireCanvasDrop,
    wireEditorChrome,
    wireExportPreviews,
    renderPalette,
    rememberSnap,
    fingerprint,
    onGridChange,
    onGridResizeStart,
    onGridResizeStop,
    stopLiveResizeMocks,
    scheduleLiveResizeMock,
    fillEditorMocks,
    /** Test-only: null grid to hit `if (!grid)` guards. */
    setGridForTest,
    setSuppressSyncForTest,
    setTgPreviewStatsForTest,
    /** Clear live-resize target without canceling a pending rAF. */
    clearResizeMockElForTest,
    clearSelection,
    applyCanvasMetrics,
    updateEmptyState,
    fitAndFillEditor,
    injectPyramidSsot,
    VECTOR_REGISTRY_KEY,
    VECTOR_REGISTRY_KEY_LEGACY,
    DEFAULT_VECTOR_ID,
    GRID_ROWS,
    GRID_COLS,
};
