import fs from 'node:fs';
import { test, expect, bindSuiteMeta } from './coverage.fixture.js';

bindSuiteMeta(test, {
  feature: 'builder-ui',
  story: 'Builder formats e2e',
  layer: 'e2e',
  component: 'builder',
  severity: 'blocker',
});

/** @param {import('@playwright/test').Page} page */
async function anb(page) {
  return page.evaluateHandle(() => globalThis.__ANB__);
}

test.describe('formats', () => {
  test('applyCanvasPreset via seam for each key', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.applyCanvasPreset('870x1080');
      A.applyCanvasPreset('1080x1080');
      A.applyCanvasPreset('1410x1080');
      A.applyCanvasPreset('missing-preset');
    });
    await expect(page.getByTestId('anb-terminal')).toBeVisible();
  });

  test('remaining early-return branches on live DOM', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    // Select a tile so keyboard guards run with selectedEl set.
    await page.locator('#anb-grid .grid-stack-item').first().click();

    await page.evaluate(async () => {
      const A = globalThis.__ANB__;
      const g = A.getGrid();
      if (!g) return;

      // onParentResize path inside fitEditorScale.
      if (typeof g.onParentResize !== 'function') {
        g.onParentResize = () => {};
      }
      A.fitEditorScale();

      // canvasDisplayHeight → 0 when chart.width is 0.
      const prevW = A.getPath('base.chart.width');
      A.setPath('base.chart.width', 0);
      const canvas = document.getElementById('anb-canvas');
      if (canvas instanceof HTMLElement) {
        A.canvasDisplayHeight(canvas);
        A.fitEditorScale();
      }
      A.setPath('base.chart.width', prevW);
      A.fitEditorScale();

      // Theme sync early return when jar flag already matches page theme.
      const html = document.documentElement;
      const pageDark = !html.classList.contains('theme-light');
      A.setPath('base.darkMode', pageDark);
      html.setAttribute('class', html.getAttribute('class') || '');

      // Export: SVG skip + invalid mode + rAF non-HTMLElement anchor.
      const group = document.querySelector('[data-testid="anb-export-links"]');
      if (group instanceof HTMLElement) {
        const junk = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        junk.setAttribute('data-anb-export', 'tg');
        group.appendChild(junk);
        const bad = document.createElement('button');
        bad.setAttribute('data-anb-export', 'nope');
        group.appendChild(bad);
        A.wireExportPreviews();
        junk.remove();
        bad.remove();

        const svgAnchor = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(svgAnchor);
        A.showExportPopover('tg', svgAnchor);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        A.hideExportPopover();
        svgAnchor.remove();

        // mouseleave relatedTarget inside group → early return.
        const tg = group.querySelector('[data-anb-export="tg"]');
        if (tg instanceof HTMLElement) {
          A.showExportPopover('tg', tg);
          group.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles: true,
              relatedTarget: tg,
            }),
          );
          const pop = document.getElementById('anb-export-popover');
          if (pop instanceof HTMLElement) {
            pop.dispatchEvent(
              new MouseEvent('mouseleave', {
                bubbles: true,
                relatedTarget: tg,
              }),
            );
          }
          // pointerdown inside group → contain early return.
          tg.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          A.hideExportPopover();
        }
      }

      // bindControls / hydrateControls skip paths.
      const root = document.getElementById('anb-options');
      if (root) {
        const noPath = document.createElement('input');
        noPath.setAttribute('data-anb-path', '');
        root.appendChild(noPath);
        const svgBool = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgBool.setAttribute('data-anb-bool', 'base.darkMode');
        root.appendChild(svgBool);
        const noBool = document.createElement('div');
        noBool.setAttribute('data-anb-bool', '');
        const seg = document.createElement('button');
        seg.className = 'plaque-field-seg__btn';
        seg.setAttribute('data-value', 'true');
        noBool.appendChild(seg);
        root.appendChild(noBool);
        A.hydrateControls();

        const other = document.createElement('div');
        root.appendChild(other);
        other.dispatchEvent(new Event('input', { bubbles: true }));
        other.dispatchEvent(new Event('change', { bubbles: true }));
        other.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // click target is Text node → not Element
        const text = document.createTextNode('opt');
        root.appendChild(text);
        text.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        text.remove();

        const inp = document.createElement('input');
        root.appendChild(inp);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));

        seg.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // click target that is a button but not inside [data-anb-bool]
        const orphan = document.createElement('button');
        orphan.className = 'plaque-field-seg__btn';
        orphan.setAttribute('data-value', 'true');
        root.appendChild(orphan);
        orphan.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        noPath.remove();
        svgBool.remove();
        noBool.remove();
        other.remove();
        inp.remove();
        orphan.remove();
      }

      // Palette click/drag without button; dragstart with btn but null dataTransfer.
      const palette = document.getElementById('anb-palette');
      if (palette) {
        palette.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        palette.dispatchEvent(new DragEvent('dragstart', { bubbles: true }));
        palette.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
        const pbtn = palette.querySelector('[data-anb-panel-id]');
        if (pbtn) {
          pbtn.dispatchEvent(new DragEvent('dragstart', { bubbles: true }));
          pbtn.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
        }
      }

      // Canvas drop without panel id.
      const dropCanvas = document.getElementById('anb-canvas');
      if (dropCanvas) {
        const dt = new DataTransfer();
        dropCanvas.dispatchEvent(
          new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }),
        );
      }

      // Panel action: Text-node target (not Element) + action outside item + click on action.
      const gridEl = document.getElementById('anb-grid');
      if (gridEl) {
        const text = document.createTextNode('x');
        gridEl.appendChild(text);
        text.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        text.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        text.remove();

        const action = gridEl.querySelector('[data-anb-action]');
        if (action) {
          action.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          const floating = document.createElement('button');
          floating.setAttribute('data-anb-action', 'copy');
          gridEl.appendChild(floating);
          floating.dispatchEvent(
            new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
          );
          floating.remove();
        }
      }

      // SELECT / INPUT / contentEditable keyboard early-out (target = focused el).
      const sel = document.createElement('select');
      document.body.appendChild(sel);
      sel.focus();
      sel.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }),
      );
      sel.remove();
      const inp2 = document.createElement('input');
      document.body.appendChild(inp2);
      inp2.focus();
      inp2.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      inp2.remove();
      const ed = document.createElement('div');
      ed.contentEditable = 'true';
      document.body.appendChild(ed);
      ed.focus();
      ed.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }),
      );
      ed.remove();

      // scheduleLiveResizeMock with no el.
      A.stopLiveResizeMocks();
      A.scheduleLiveResizeMock();

      // onGridResizeStop without node.
      A.onGridResizeStop({}, document.createElement('div'));

      // loadItems skips bad clamp.
      A.loadItems([{ type: 'nope', x: 0, y: 0, w: 2, h: 2 }]);

      // readItemsFromGrid null type node.
      if (g.engine) {
        g.engine.nodes = [{ el: document.createElement('div'), x: 0, y: 0, w: 1, h: 1 }];
        A.readItemsFromGrid();
      }

      // refreshExportPopoverIfOpen when stage missing but mode open.
      const tgBtn = document.querySelector('[data-anb-export="tg"]');
      if (tgBtn instanceof HTMLElement) {
        A.showExportPopover('tg', tgBtn);
        const stage = document.getElementById('anb-export-popover-stage');
        stage?.remove();
        A.refreshExportPopoverIfOpen();
      }
    });
  });

  test('early-return guards via setGridForTest + meta attrs', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.panelInnerHtml({
        id: 'durationsByLayer',
        type: 'currentStatus',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      });
      A.panelInnerHtml({
        id: 'problemsDistribution',
        type: 'currentStatus',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      });

      const g = A.getGrid();
      if (g) {
        const saved = g.setAnimation;
        g.setAnimation = undefined;
        g.opts = g.opts || {};
        A.setGridAnimate(false);
        g.setAnimation = saved;
      }

      const ghost = document.createElement('div');
      ghost.gridstackNode = { w: 2, h: 2, x: 0, y: 0 };
      A.copyItem(ghost);
      ghost.dataset.type = 'totally-unknown-type';
      A.copyItem(ghost);
      A.addItem('totally-unknown-type', { w: 2, h: 2 });
      A.deleteItem(null);

      const ed = document.createElement('div');
      ed.contentEditable = 'true';
      document.body.appendChild(ed);
      ed.focus();
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      ed.remove();

      const el = document.querySelector('#anb-grid .grid-stack-item');
      if (el instanceof HTMLElement) {
        Object.defineProperty(el, 'gridstackNode', {
          configurable: true,
          value: { w: 0, h: 0 },
        });
        A.onGridResizeStop({}, el);
        const RO = globalThis.ResizeObserver;
        // @ts-ignore
        delete globalThis.ResizeObserver;
        A.onGridResizeStart({}, el);
        globalThis.ResizeObserver = RO;
      }

      const kept = A.getGrid();
      A.setSuppressSyncForTest(true);
      A.onGridChange();
      A.setSuppressSyncForTest(false);
      A.setGridForTest(null);
      A.setGridAnimate(true);
      A.fitAndFillEditor();
      A.readItemsFromGrid();
      A.loadItems([{ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 }]);
      A.clearAll();
      A.deleteItem(document.createElement('div'));
      A.setGridForTest(kept);

      document.getElementById('anb-export-popover-stage')?.remove();
      const tg = document.querySelector('[data-anb-export="tg"]');
      if (tg instanceof HTMLElement) A.showExportPopover('tg', tg);
      A.refreshExportPopoverIfOpen();

      document.getElementById('anb-canvas')?.remove();
      A.applyCanvasMetrics();
      A.syncEditorChrome();
      A.fitEditorScale();
      document.getElementById('anb-options')?.remove();
      A.hydrateControls();
      A.bindControls();
      document.getElementById('anb-empty')?.remove();
      A.updateEmptyState();
    });
  });
});

test.describe('panels', () => {
  test('panel bar copy/delete actions + toolbar copy + keyboard', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    const first = page.locator('#anb-grid .grid-stack-item').first();
    await first.click();

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      const el = document.querySelector('#anb-grid .grid-stack-item');
      const btn = document.querySelector('[data-anb-action="copy"]');
      if (btn instanceof HTMLElement) {
        btn.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse',
          }),
        );
      }
      if (el instanceof HTMLElement) A.copyItem(el);
      const del = document.querySelector('[data-anb-action="delete"]');
      if (del instanceof HTMLElement) {
        del.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse',
          }),
        );
      }
    });

    const tile = page.locator('#anb-grid .grid-stack-item').first();
    await tile.click();
    await page.getByTestId('anb-btn-copy').click();
    await page.getByTestId('anb-btn-delete').click();
    await tile.click({ trial: true }).catch(() => {});
    const any = page.locator('#anb-grid .grid-stack-item').first();
    if (await any.count()) {
      await any.click();
      await page.keyboard.press('Control+c');
      await page.keyboard.press('Backspace');
    }

    await page.getByTestId('anb-canvas').click({ position: { x: 8, y: 8 } });
    await expect(page.getByTestId('anb-btn-copy')).toBeDisabled();

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.copyItem(document.createElement('div'));
      A.deleteItem(document.createElement('div'));
    });
  });

  test('palette click-add + no-space alert path', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => {
      await d.accept();
    });
    await page.getByTestId('anb-btn-clear').click();
    await page.getByTestId('anb-palette-pie').click();
    await expect(page.locator('#anb-grid .grid-stack-item')).toHaveCount(1);

    // Fill grid via seam until addItem alerts.
    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      for (let i = 0; i < 40; i += 1) {
        A.addItem('currentStatus', { w: 2, h: 2 });
      }
      A.addItem('currentStatus', { w: 10, h: 10 });
      A.addItem('not-a-panel');
      A.findFreeSpot(2, 2, 0, 0);
      A.findFreeSpot(2, 2, null, null);
      A.findFreeSpot(11, 11, null, null);
    });
  });
});

test.describe('messengers', () => {
  test('caption languages + percentage helpers via seam', async ({ page }) => {
    await page.goto('/');
    const out = await page.evaluate(() => {
      const A = globalThis.__ANB__;
      return {
        empty: A.normalizeVectorId(''),
        hashOnly: A.normalizeVectorId('   #   '),
        colon: A.normalizeVectorId('vector:deadbeef'),
        hash: A.normalizeVectorId('#cafebabe'),
        esc: A.escapeHtml('<b>&"'),
        en: A.phrasesFor('en').results,
        de: A.phrasesFor('de').results,
        fr: A.phrasesFor('fr').results,
        ru: A.phrasesFor('ru').results,
        by: A.phrasesFor('by').results,
        ua: A.phrasesFor('ua').results,
        cn: A.phrasesFor('cn').results,
        cnt: A.phrasesFor('cnt').results,
        fallback: A.phrasesFor('nope').results,
        dur: A.formatDurationMs(56205),
        pctInt: A.formatPercentage(1, 2),
        pctFrac: A.formatPercentage(2, 3),
        pctEmpty: A.formatPercentage(0, 10),
        overlap: A.rectsOverlap(
          { type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 },
          { type: 'currentStatus', x: 1, y: 1, w: 2, h: 2 },
        ),
        noOverlap: A.rectsOverlap(
          { type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 },
          { type: 'currentStatus', x: 3, y: 0, w: 2, h: 2 },
        ),
        clampNull: A.clampItem({ type: 'totally-unknown' }),
        clampOk: A.clampItem({ type: 'currentStatus', x: -1, y: 99, w: 99, h: 99 }),
        pathNull: A.resolvePath('x'),
        vh: A.vectorHash({ a: 1 }),
        free: A.freeCellRect(
          { width: 870, height: 1080, cardGap: 14 },
          { type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 },
        ),
        freeDefaultGap: A.freeCellRect(
          { width: 870, height: 1080 },
          { type: 'currentStatus', x: 2, y: 2, w: 2, h: 2 },
        ),
      };
    });
    expect(out.empty).toBe('');
    expect(out.colon).toBe('vector#deadbeef');
    expect(out.pctInt).toContain('50');
    expect(out.clampNull).toBeNull();
    expect(out.clampOk.w).toBeLessThanOrEqual(10);
  });

  test('language select refreshes messenger caption', async ({ page }) => {
    await page.goto('/');
    const lang = page.locator('[data-anb-path="base.language"]');
    if (await lang.count()) {
      await lang.selectOption('ru');
      await lang.selectOption('de');
      await lang.selectOption('fr');
      await lang.selectOption('en');
    }
    await expect(page.getByTestId('anb-tg-text')).toBeVisible();
  });
});

test.describe('export', () => {
  test('export popover toggle, focus, outside click, resize refresh', async ({
    page,
  }) => {
    await page.goto('/');
    const tg = page.locator('[data-anb-export="tg"]');
    const full = page.locator('[data-anb-export="full"]');
    await tg.hover();
    await expect(page.locator('#anb-export-popover')).toBeVisible();
    await tg.hover(); // toggle same trigger → hide path when re-open logic runs
    await full.focus();
    await expect(page.locator('#anb-export-popover')).toBeVisible();
    await page.mouse.click(4, 4);
    await page.setViewportSize({ width: 900, height: 700 });
    await tg.hover();
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('term reset + download + clipboard fallback path', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-term-reset').click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('anb-term-download').click();
    await downloadPromise;

    await page.evaluate(async () => {
      const A = globalThis.__ANB__;
      // Force clipboard fallback in copyConfigJson by breaking clipboard.
      const original = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('deny');
          },
        },
      });
      await pageClickCopy();
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: original,
      });

      async function pageClickCopy() {
        document.getElementById('anb-term-copy')?.click();
        await new Promise((r) => setTimeout(r, 50));
      }
      void A;
    });
  });
});

test.describe('negative', () => {
  test('vector input miss / default / restore + legacy registry migrate', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const legacy = 'allure-notifications-builder-vector-registry';
      const main = 'anb-apps-builder-vector-registry';
      localStorage.removeItem(main);
      localStorage.setItem(
        legacy,
        JSON.stringify({
          'vector#abcd1234': {
            base: {
              project: 'legacy',
              enableChart: true,
              chart: { width: 870, height: 1080, items: [] },
            },
            telegram: {},
          },
          'vector#default': { base: { project: 'stale-default' }, telegram: {} },
          'vector#bad': null,
          'vector#ok': {
            base: {
              project: 'ok',
              enableChart: true,
              chart: { width: 870, height: 1080, items: [] },
            },
            telegram: { token: 't' },
          },
        }),
      );
    });
    await page.goto('/');
    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      localStorage.removeItem(A.VECTOR_REGISTRY_KEY);
      localStorage.setItem(
        A.VECTOR_REGISTRY_KEY_LEGACY,
        JSON.stringify({
          'vector#zzzz9999': {
            base: {
              project: 'legacy2',
              enableChart: true,
              chart: { width: 870, height: 1080, items: [] },
            },
            telegram: {},
          },
        }),
      );
      A.loadVectorRegistry();
    });

    const input = page.locator('#anb-term-vector');
    await input.fill('vector#missingdead');
    await input.blur();
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await input.fill('vector#default');
    await input.press('Enter');

    await input.fill('bogus');
    await input.press('Escape');

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.commitVector('');
      A.commitVector('vector#default');
      A.commitVector('vector#not-registered');
      A.setPath('base.project', 'coverage');
      A.setPath('nope', 1);
      A.getPath('base.project');
      A.getPath('missing.path.here');
      const fake = document.createElement('input');
      fake.setAttribute('data-anb-number', '');
      fake.value = '12';
      A.controlValue(fake);
      fake.value = 'NaN';
      A.controlValue(fake);
      const sel = document.createElement('select');
      sel.innerHTML = '<option value="x" selected>x</option>';
      A.controlValue(sel);
    });
  });

  test('header theme sync + chart-off + empty path edges', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('#app-header [data-theme-toggle], #app-header .theme-toggle, button[aria-label*="theme" i]').first();
    if (await themeBtn.count()) {
      await themeBtn.click();
      await themeBtn.click();
    }
    await page
      .getByTestId('anb-bool-enableChart')
      .locator('.plaque-field-seg__btn[data-value="false"]')
      .click();
    await page
      .getByTestId('anb-bool-enableChart')
      .locator('.plaque-field-seg__btn[data-value="true"]')
      .click();
    await page
      .getByTestId('anb-bool-darkMode')
      .locator('.plaque-field-seg__btn[data-value="false"]')
      .click();

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.clearAll();
      A.resetToDefault();
      A.deleteItem(document.createElement('div'));
    });
  });

  test('resize handle triggers initGrid live mock path', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    const handle = page.locator('#anb-grid .ui-resizable-handle, #anb-grid .ui-resizable-se').first();
    if (await handle.count()) {
      const box = await handle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 40, box.y + 40, { steps: 8 });
        await page.mouse.up();
      }
    }

    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      const canvas = document.getElementById('anb-canvas');
      if (canvas instanceof HTMLElement) A.canvasDisplayHeight(canvas);
      A.setGridAnimate(false);
      A.setGridAnimate(true);
      A.fitEditorScale();
      A.readItemsFromGrid();
      A.loadItems([]);
      A.loadItems([
        { type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 },
        { type: 'durations', x: 2, y: 0, w: 2, h: 2, groupBy: 'layer' },
        { type: 'problemsDistribution', x: 4, y: 0, w: 2, h: 2, by: 'environment' },
      ]);
      const stage = document.createElement('div');
      A.renderCollageStage(stage, 'tg');
      A.renderCollageStage(stage, 'full');
      A.previewItemHtml({ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 });
      A.previewItemHtml({
        type: 'durations',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        groupBy: 'layer',
        by: 'environment',
      });
      A.panelInnerHtml({ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 });
      A.panelInnerHtml({
        type: 'stabilityDistribution',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        groupBy: 'feature',
      });
      A.makeWidgetEl({
        type: 'problemsDistribution',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        by: 'environment',
      });

      // Export open/toggle + refresh + hide branches.
      const tg = document.querySelector('[data-anb-export="tg"]');
      if (tg instanceof HTMLElement) {
        A.showExportPopover('tg', tg);
        A.refreshExportPopoverIfOpen();
        A.showExportPopover('tg', tg); // same → caller toggles in wire; direct show ok
        A.hideExportPopover();
      }

      // GridStack missing branch.
      const saved = globalThis.GridStack;
      globalThis.GridStack = undefined;
      A.initGrid();
      globalThis.GridStack = saved;

      // ResizeObserver-less resizestart path: strip RO then re-init grid.
      const RO = globalThis.ResizeObserver;
      // @ts-ignore
      delete globalThis.ResizeObserver;
      A.initGrid();
      globalThis.ResizeObserver = RO;

      // GridStack resize/change events for live mock + syncItemsToState.
      const g = A.getGrid();
      const itemEl = document.querySelector('#anb-grid .grid-stack-item');
      if (g && itemEl instanceof HTMLElement) {
        g.resize?.(itemEl, 3, 3);
        g.onParentResize?.();
        A.setGridAnimate(false);
        if (!g.opts) g.opts = {};
        A.setGridAnimate(true);
        // Fire resizestart/resizestop handlers registered in initGrid.
        g.trigger?.('resizestart', {}, itemEl);
        g.trigger?.('resizestop', {}, itemEl);
        // Fallback: mutate node to <1 and stop.
        if (itemEl.gridstackNode) {
          itemEl.gridstackNode.w = 0;
          itemEl.gridstackNode.h = 0;
          g.trigger?.('resizestop', {}, itemEl);
        }
      }

      // Export: toggle same trigger, touch pointer, mouseleave stay/leave.
      const group = document.querySelector('[data-testid="anb-export-links"]');
      const tgBtn = document.querySelector('[data-anb-export="tg"]');
      const popover = document.getElementById('anb-export-popover');
      if (tgBtn instanceof HTMLElement) {
        A.showExportPopover('tg', tgBtn);
        // Re-enter open() toggle via synthetic mouseenter on same button.
        tgBtn.dispatchEvent(new Event('mouseenter', { bubbles: true }));
        tgBtn.dispatchEvent(new Event('mouseenter', { bubbles: true }));
        tgBtn.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
          }),
        );
        tgBtn.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerType: 'pen',
          }),
        );
        tgBtn.focus();
        if (group instanceof HTMLElement && popover instanceof HTMLElement) {
          group.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles: true,
              relatedTarget: popover,
            }),
          );
          popover.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles: true,
              relatedTarget: group,
            }),
          );
          popover.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles: true,
              relatedTarget: document.body,
            }),
          );
        }
        document.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
          }),
        );
        A.hideExportPopover();
      }

      // Keyboard early-outs when focus is in INPUT.
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      input.remove();

      // Missing vector input element → wireVectorInput early return.
      const vector = document.getElementById('anb-term-vector');
      vector?.remove();
      A.wireVectorInput();

      // Commit registered snap path.
      const snap = {
        base: {
          project: 'snap-cov',
          enableChart: true,
          chart: { width: 870, height: 1080, items: [] },
        },
        telegram: {},
      };
      const id = A.rememberSnap(snap);
      A.commitVector(id);
      A.fingerprint();

      A.hydrateControls();
      A.syncEditorChrome();
      A.wireHeaderThemeDarkModeSync();
      A.wireCanvasDrop();
      A.wireEditorChrome();
      A.wireExportPreviews();
      A.renderPalette();
      A.bindControls();

      // Named grid handlers — all branches.
      A.onGridChange();
      A.onGridResizeStart({}, null);
      A.onGridResizeStart({}, document.createElement('div'));
      const roEl = document.querySelector('#anb-grid .grid-stack-item');
      if (roEl instanceof HTMLElement) {
        A.onGridResizeStart({}, roEl);
        A.scheduleLiveResizeMock();
        A.scheduleLiveResizeMock(); // early return while raf pending
        A.stopLiveResizeMocks();
        A.onGridResizeStop({}, null);
        A.onGridResizeStop({}, document.createElement('div'));
        A.onGridResizeStop({}, roEl);
        if (roEl.gridstackNode) {
          roEl.gridstackNode.w = 0;
          roEl.gridstackNode.h = 0;
          A.onGridResizeStop({}, roEl);
        }
        const RO2 = globalThis.ResizeObserver;
        // @ts-ignore
        delete globalThis.ResizeObserver;
        A.onGridResizeStart({}, roEl);
        globalThis.ResizeObserver = RO2;
      }

      // Early-return wiring when hosts missing.
      document.querySelector('[data-testid="anb-export-links"]')?.remove();
      A.wireExportPreviews();
      document.getElementById('anb-palette')?.remove();
      A.renderPalette();
      document.getElementById('anb-canvas')?.remove();
      A.wireCanvasDrop();
      document.getElementById('anb-grid')?.remove();
      A.wireEditorChrome();
      A.readItemsFromGrid();
    });
  });

  test('branch gaps: stats override, nullish, DOM absences, drafts', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => {
      localStorage.setItem(
        'anb-apps-builder-vector-registry',
        JSON.stringify({
          'vector#preseeded': {
            base: {
              project: 'preseed',
              enableChart: true,
              chart: { width: 870, height: 1080, items: [] },
            },
            telegram: {},
          },
        }),
      );
    });
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();

    // vectorDraft != null while typing (no commit).
    await page.locator('#anb-term-vector').fill('vector#drafty');
    await page.evaluate(() => {
      const A = globalThis.__ANB__;
      A.renderTerminal();
      A.renderVectorInput();
    });

    // Soft branches (keep DOM intact).
    await page.evaluate(async () => {
      const A = globalThis.__ANB__;
      const rows = A.GRID_ROWS;
      A.injectPyramidSsot();

      // Toolbar copy/delete when nothing selected (falsy selectedEl).
      A.clearSelection();
      document.getElementById('anb-btn-copy')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      document.getElementById('anb-btn-delete')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );

      A.setTgPreviewStatsForTest({
        total: 0,
        passed: 0,
        failed: 0,
        broken: 0,
        unknown: 0,
        skipped: 0,
        durationMs: 0,
      });
      A.buildTgCaptionHtml();
      A.renderMessengerPreview();
      A.setTgPreviewStatsForTest(null);

      A.freeCellRect(
        { width: 870, height: 1080, cardGap: 16 },
        { type: 'currentStatus', x: 0, y: rows - 2, w: 2, h: 2 },
      );
      A.chromeCssVars({});
      A.chromeCssVars({ headerHeight: Number.NaN, tilePad: Number.NaN });

      A.setPath('base.chart.width', 123);
      A.setPath('base.chart.height', 456);
      A.canvasKeyFromState();
      A.hydrateControls();
      A.clampItem({ type: 'currentStatus' });
      A.previewItemHtml({ type: 'totally-unknown', x: 0, y: 0, w: 2, h: 2 });
      A.panelInnerHtml({ type: 'totally-unknown', x: 0, y: 0, w: 2, h: 2 });

      A.applySnap({
        base: {
          project: 'no-items',
          enableChart: true,
          chart: { width: 870, height: 1080, items: null },
        },
        telegram: {},
      });

      const mocks = window.WidgetTileMocks;
      // @ts-ignore
      delete window.WidgetTileMocks;
      const stage = document.createElement('div');
      A.setPath('base.chart.items', null);
      A.renderCollageStage(stage, 'tg');
      A.setPath('base.chart.items', [{ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 }]);
      A.renderCollageStage(stage, 'tg');
      A.makeWidgetEl({ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 });
      A.fillEditorMocks(document.createElement('div'));
      const pal = document.getElementById('anb-palette');
      if (pal) A.renderPalette();
      window.WidgetTileMocks = mocks;

      const g = A.getGrid();
      if (g) {
        const savedAnim = g.setAnimation;
        const savedOpts = g.opts;
        g.setAnimation = undefined;
        g.opts = { animate: true };
        A.setGridAnimate(false);
        g.opts = undefined;
        A.setGridAnimate(true);
        g.setAnimation = savedAnim;
        g.opts = savedOpts;

        const eng = g.engine;
        g.engine = undefined;
        A.readItemsFromGrid();
        const nodeEl = document.createElement('div');
        nodeEl.dataset.type = 'currentStatus';
        g.engine = {
          nodes: [{ el: nodeEl, x: null, y: null, w: null, h: null }],
        };
        A.readItemsFromGrid();
        g.engine = eng;
      }

      // addItem/loadItems without gridstackNode — stub grid (don't break real GridStack).
      const kept = A.getGrid();
      A.setGridForTest({
        makeWidget: () => {},
        removeAll: () => {},
        cellHeight: () => {},
        setAnimation: () => {},
        onParentResize: () => {},
        engine: { nodes: [] },
        opts: {},
        update: () => {},
      });
      A.addItem('currentStatus', { w: 2, h: 2, preferX: 0, preferY: 0 });
      A.loadItems([{ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 }]);
      A.setGridForTest(kept);

      // copyItem nullish geometry — stub addItem path via stub grid (avoid GridStack).
      A.setGridForTest({
        makeWidget: () => {},
        removeAll: () => {},
        cellHeight: () => {},
        setAnimation: () => {},
        engine: { nodes: [] },
        opts: { minRow: 10, maxRow: 10 },
        update: () => {},
      });
      const ghost = document.createElement('div');
      ghost.dataset.type = 'currentStatus';
      ghost.gridstackNode = { w: null, h: null, x: null, y: null };
      A.copyItem(ghost);
      A.setGridForTest(kept);

      // Palette text-node target + empty panel id.
      if (pal) {
        const t = document.createTextNode('p');
        pal.appendChild(t);
        t.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        t.dispatchEvent(new DragEvent('dragstart', { bubbles: true }));
        t.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
        t.remove();
        const emptyId = document.createElement('button');
        emptyId.setAttribute('data-anb-panel-id', '');
        pal.appendChild(emptyId);
        emptyId.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const dtEmpty = new DataTransfer();
        emptyId.dispatchEvent(
          new DragEvent('dragstart', { bubbles: true, dataTransfer: dtEmpty }),
        );
        emptyId.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
        emptyId.remove();
      }

      // Canvas dragover with / without panel-id type.
      const dropCanvas = document.getElementById('anb-canvas');
      if (dropCanvas) {
        const dt = new DataTransfer();
        dt.setData('text/anb-panel-id', 'currentStatus');
        dropCanvas.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt,
          }),
        );
        dropCanvas.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          }),
        );
      }

      // Export mouseleave relatedTarget outside → hide; inside → stay.
      const group = document.querySelector('[data-testid="anb-export-links"]');
      const tgBtn = document.querySelector('[data-anb-export="tg"]');
      if (group instanceof HTMLElement && tgBtn instanceof HTMLElement) {
        A.showExportPopover('tg', tgBtn);
        group.dispatchEvent(
          new MouseEvent('mouseleave', {
            bubbles: true,
            relatedTarget: document.body,
          }),
        );
        A.showExportPopover('tg', tgBtn);
        const pop = document.getElementById('anb-export-popover');
        if (pop) {
          group.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles: true,
              relatedTarget: pop,
            }),
          );
        }
        A.hideExportPopover();
      }

      // Keyboard: non-HTMLElement target while selected.
      A.resetToDefault();
      const tile = document.querySelector('#anb-grid .grid-stack-item');
      if (tile instanceof HTMLElement) {
        tile.click();
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(svg);
        svg.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
        svg.remove();
      }

      // chart-group non-input child.
      const chartGroup = document.querySelector('[data-testid="anb-group-chart"]');
      const junk = document.createElement('div');
      chartGroup?.appendChild(junk);
      A.applyChartFlags();
      junk.remove();

      // hydrate non-input path el.
      const root = document.getElementById('anb-options');
      if (root) {
        const divPath = document.createElement('div');
        divPath.setAttribute('data-anb-path', 'base.project');
        root.appendChild(divPath);
        A.hydrateControls();
        divPath.remove();
      }

      // resizeMockEl cleared before rAF body (keep rAF scheduled).
      const el = document.createElement('div');
      A.onGridResizeStart({}, el);
      A.scheduleLiveResizeMock();
      A.clearResizeMockElForTest();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      A.stopLiveResizeMocks();

      // nullish w/h on resize stop.
      const rz = document.createElement('div');
      rz.gridstackNode = { w: 0, h: undefined };
      A.onGridResizeStop({}, rz);
      rz.gridstackNode = { w: undefined, h: 0 };
      A.onGridResizeStop({}, rz);
      rz.gridstackNode = { w: undefined, h: undefined };
      A.onGridResizeStop({}, rz);

      A.setPath('base.chart.headerHeight', null);
      A.setPath('base.chart.tilePad', null);
      A.syncEditorChrome();

      // clipboard missing → fallback.
      Object.defineProperty(Navigator.prototype, 'clipboard', {
        configurable: true,
        get: () => undefined,
      });
      document.getElementById('anb-term-copy')?.click();
    });

    // Destructive absences last (own evaluate).
    await page.evaluate(() => {
      const A = globalThis.__ANB__;

      // Theme sync when darkMode field missing.
      document.querySelector('[data-anb-bool="base.darkMode"]')?.remove();
      A.setPath('base.darkMode', true);
      document.documentElement.classList.add('theme-light');

      // fitEditorScale with SVG grid host.
      const gridEl = document.getElementById('anb-grid');
      const gridParent = gridEl?.parentNode;
      const svgGrid = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgGrid.id = 'anb-grid';
      if (gridEl && gridParent) {
        gridParent.replaceChild(svgGrid, gridEl);
        A.fitEditorScale();
        gridParent.replaceChild(gridEl, svgGrid);
      }

      document.getElementById('anb-tg-bot-name')?.remove();
      document.getElementById('anb-tg-text')?.remove();
      A.renderMessengerPreview();

      document.getElementById('anb-canvas')?.remove();
      document.getElementById('anb-palette')?.remove();
      document.getElementById('anb-btn-reset')?.remove();
      document.getElementById('anb-btn-clear')?.remove();
      document.querySelector('[data-testid="anb-group-chart"]')?.remove();
      A.applyChartFlags();
      A.syncEditorChrome();

      document.querySelector('[data-anb-canvas]')?.remove();
      A.hydrateControls();

      document.getElementById('anb-layout')?.remove();
      document.getElementById('anb-btn-copy')?.remove();
      document.getElementById('anb-btn-delete')?.remove();
      A.updateToolbar();

      // loadItems offsetHeight skip when #anb-grid missing (keep stub grid healthy).
      const ge = document.getElementById('anb-grid');
      ge?.remove();
      const kept = A.getGrid();
      A.setGridForTest({
        makeWidget: () => {},
        removeAll: () => {},
        cellHeight: () => {},
        setAnimation: () => {},
        engine: { nodes: [] },
        opts: {},
      });
      A.loadItems([{ type: 'currentStatus', x: 0, y: 0, w: 2, h: 2 }]);
      A.setGridForTest(kept);

      document.getElementById('anb-export-popover')?.remove();
      A.hideExportPopover();
      A.renderCollageStage(document.createElement('div'), 'full');
      A.wireExportPreviews();

      // initGrid without canvas → cellH fallback 40 (keep #anb-grid host).
      const host = document.createElement('div');
      host.id = 'anb-grid';
      document.body.appendChild(host);
      A.initGrid();

      // initGrid when host missing → GridStack.init yields null → guard return.
      host.remove();
      A.initGrid();
    });
  });
});
