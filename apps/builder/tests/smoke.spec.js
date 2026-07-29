// @ts-check
const { test, expect } = require('@playwright/test');

/** SQ-1080 canon 4-tile — must match @allure-notifications/config DEFAULT_ITEMS + CANON.md */
const SQ1080_ITEMS = [
  { type: 'pie', x: 0, y: 0, w: 4, h: 4 },
  { type: 'durationDynamics', x: 4, y: 0, w: 6, h: 4 },
  { type: 'testingPyramid', x: 0, y: 4, w: 3, h: 3 },
  { type: 'durations', x: 3, y: 4, w: 4, h: 3, groupBy: 'layer' },
];

test.describe('allure-notifications-builder smoke', () => {
  test('shell mounts: header, 3 zones, terminal JSON', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('anb-page')).toBeVisible();
    await expect(page.getByTestId('anb-layout')).toBeVisible();
    await expect(page.getByTestId('anb-zone-options')).toBeVisible();
    await expect(page.getByTestId('anb-zone-preview')).toBeVisible();
    await expect(page.getByTestId('anb-terminal')).toBeVisible();
    await expect(page.locator('#app-header')).not.toBeEmpty();
  });

  test('header tool links: monorepo + prod builder site', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('anb-page')).toBeVisible();
    const github = page.getByTestId('header-github');
    await expect(github).toHaveAttribute(
      'href',
      'https://github.com/qa-guru/allure-notifications',
    );
    await expect(github).toHaveAttribute('aria-label', 'allure-notifications');
    const site = page.getByTestId('header-github-pages');
    await expect(site).toHaveAttribute(
      'href',
      'https://allure-notifications.qa.guru',
    );
    await expect(site).toHaveAttribute('aria-label', 'allure-notifications');
    await expect(site.locator('.icon img[src*="allure3-logo"]')).toBeVisible();
  });

  test('Reset → CB-870 free chart + chrome defaults in terminal', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-chart-header-height').fill('90');
    await page.getByTestId('anb-chart-card-gap').fill('20');
    await page.getByTestId('anb-chart-tile-pad').fill('10');
    await page.getByTestId('anb-btn-reset').click();
    await expect
      .poll(async () => {
        const raw = await page.getByTestId('anb-terminal').innerText();
        return JSON.parse(raw).base.chart;
      })
      .toMatchObject({
        mode: 'collage',
        layout: 'free',
        width: 870,
        height: 1080,
        headerHeight: 22,
        cardGap: 14,
        tilePad: 6,
        gridCols: 10,
        gridRows: 10,
        pyramidFallback: 'suites',
        items: SQ1080_ITEMS,
      });
  });

  test('chrome knobs write numbers into terminal JSON', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-chart-header-height').fill('80');
    await page.getByTestId('anb-chart-card-gap').fill('18');
    await page.getByTestId('anb-chart-tile-pad').fill('8');
    await expect
      .poll(async () => {
        const raw = await page.getByTestId('anb-terminal').innerText();
        const chart = JSON.parse(raw).base.chart;
        return {
          headerHeight: chart.headerHeight,
          cardGap: chart.cardGap,
          tilePad: chart.tilePad,
        };
      })
      .toEqual({ headerHeight: 80, cardGap: 18, tilePad: 8 });
  });

  test('canvas presets only 870 / 1080 / 1410', async ({ page }) => {
    await page.goto('/');
    const select = page.getByTestId('anb-canvas-preset');
    const values = await select.locator('option').evaluateAll((opts) =>
      opts.map((o) => /** @type {HTMLOptionElement} */ (o).value),
    );
    expect(values).toEqual(['870x1080', '1080x1080', '1410x1080']);
  });

  test('canvas preset updates editor aspect ratio', async ({ page }) => {
    await page.goto('/');
    const select = page.getByTestId('anb-canvas-preset');

    /** @param {string} preset */
    async function canvasRatio(preset) {
      await select.selectOption(preset);
      await page.waitForFunction(
        (expected) => {
          const el = document.getElementById('anb-canvas');
          if (!el) return false;
          const r = el.getBoundingClientRect();
          if (!(r.width > 0 && r.height > 0)) return false;
          const ratio = r.width / r.height;
          return Math.abs(ratio - expected) < 0.02;
        },
        preset === '1080x1080' ? 1 : Number(preset.split('x')[0]) / Number(preset.split('x')[1]),
      );
      return page.evaluate(() => {
        const r = document.getElementById('anb-canvas').getBoundingClientRect();
        return r.width / r.height;
      });
    }

    expect(await canvasRatio('1080x1080')).toBeCloseTo(1, 2);
    expect(await canvasRatio('870x1080')).toBeCloseTo(870 / 1080, 2);
    expect(await canvasRatio('1410x1080')).toBeCloseTo(1410 / 1080, 2);
    await select.selectOption('870x1080');
    expect(await canvasRatio('1410x1080')).toBeCloseTo(1410 / 1080, 2);
  });

  test('telegram messenger pane is live (no stub tabs)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('anb-group-messengers')).toBeVisible();
    await expect(page.getByText('Telegram · live')).toBeVisible();
    await expect(page.getByTestId('anb-messenger-telegram')).toBeVisible();
    await expect(page.getByTestId('anb-tab-telegram')).toHaveCount(0);
    await expect(page.getByTestId('anb-stub-slack')).toHaveCount(0);
  });

  test('export preview links in preview bar; caption under canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('anb-export-tg')).toBeVisible();
    await expect(page.getByTestId('anb-export-full')).toBeVisible();
    await expect(page.getByTestId('anb-tg-preview')).toHaveCount(0);
    await page.getByTestId('anb-export-tg').hover();
    await expect(page.getByTestId('anb-export-popover')).toBeVisible();
    await page.locator('[data-anb-path="base.environment"]').fill('prod');
    await page.locator('[data-anb-path="base.language"]').selectOption('ru');
    await expect(page.getByTestId('anb-tg-text')).toContainText('Результаты');
    await expect(page.getByTestId('anb-tg-text')).toContainText('prod');
    await expect(page.getByTestId('anb-tg-text')).toContainText('Всего сценариев');
    await expect(page.getByTestId('anb-tg-text')).toContainText('00:00:56.205');
    await expect(page.getByTestId('anb-tg-text')).toContainText('TestOps');
    await expect(page.getByTestId('anb-tg-text')).toContainText('Сборка');
    await expect
      .poll(async () =>
        page.getByTestId('anb-tg-text').evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            bg: cs.backgroundColor,
            fits: el.scrollHeight <= el.clientHeight + 1,
          };
        }),
      )
      .toEqual({ bg: 'rgba(0, 0, 0, 0)', fits: true });
  });

  test('Full size export popover fits WD-1410 without CSS clip', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/');
    await page.locator('[data-anb-canvas]').selectOption('1410x1080');
    await page.getByTestId('anb-export-full').hover();
    const popover = page.getByTestId('anb-export-popover');
    await expect(popover).toBeVisible();
    await expect(popover.locator('#anb-export-popover-meta')).toHaveCount(0);
    await expect(popover.locator('#anb-export-popover-viewport')).toHaveCount(0);
    const fit = await page.evaluate(() => {
      const pop = document.getElementById('anb-export-popover');
      const stage = document.getElementById('anb-export-popover-stage');
      if (!(pop instanceof HTMLElement) || !(stage instanceof HTMLElement)) {
        return { ok: false, reason: 'missing nodes' };
      }
      const box = pop.getBoundingClientRect();
      const scaleMatch = /scale\(([\d.]+)\)/.exec(stage.style.transform || '');
      const scale = scaleMatch ? Number(scaleMatch[1]) : 1;
      const logicalW = parseFloat(stage.style.width) || 0;
      const logicalH = parseFloat(stage.style.height) || 0;
      const expectedW = Math.round(logicalW * scale);
      const expectedH = Math.round(logicalH * scale);
      return {
        ok:
          logicalW === 1410 &&
          logicalH === 1080 &&
          Math.abs(box.width - expectedW) <= 2 &&
          Math.abs(box.height - expectedH) <= 2,
        logicalW,
        logicalH,
        scale,
        boxW: box.width,
        boxH: box.height,
        expectedW,
        expectedH,
      };
    });
    expect(fit.ok, JSON.stringify(fit)).toBe(true);
  });

  test('Download config.json is jar-shaped', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('anb-term-download').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('config.json');
    const path = await download.path();
    expect(path).toBeTruthy();
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
    expect(cfg.telegram).toBeTruthy();
    expect(cfg.base.chart.layout).toBe('free');
    expect(cfg.base.chart.items).toEqual(SQ1080_ITEMS);
    expect(cfg.base.chart.width).toBe(870);
    expect(cfg.base.chart.height).toBe(1080);
    expect(cfg.base.chart.headerHeight).toBe(22);
    expect(cfg.base.chart.cardGap).toBe(14);
    expect(cfg.base.chart.tilePad).toBe(6);
    expect(cfg.vector).toMatch(/^vector#[0-9a-f]{8}$/);
  });

  test('boolean seg toggles enableChart / darkMode into terminal + preview', async ({
    page,
  }) => {
    await page.goto('/');
    const enable = page.getByTestId('anb-bool-enableChart');
    const dark = page.getByTestId('anb-bool-darkMode');
    const terminal = page.getByTestId('anb-terminal');
    const canvas = page.getByTestId('anb-canvas');
    const previewPanel = page.getByTestId('anb-preview-panel');
    const optionsPanel = page.getByTestId('anb-options');
    const termPanel = page.getByTestId('anb-terminal-panel');

    await expect(canvas).toHaveAttribute('data-anb-dark', 'true');
    await expect(previewPanel).toHaveAttribute('data-anb-dark', 'true');
    await expect(canvas).not.toHaveClass(/anb-canvas--chart-off/);

    const optionsBgBefore = await optionsPanel.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const termBgBefore = await termPanel.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await dark.locator('.plaque-field-seg__btn[data-value="false"]').click();
    await expect(dark.locator('.plaque-field-seg__btn--on')).toHaveAttribute(
      'data-value',
      'false',
    );
    await expect(terminal).toContainText('"darkMode": false');
    await expect(canvas).toHaveAttribute('data-anb-dark', 'false');
    await expect(previewPanel).toHaveAttribute('data-anb-dark', 'false');
    // Config darkMode → preview panel only; Options / terminal stay put.
    await expect(optionsPanel).toHaveCSS('background-color', optionsBgBefore);
    await expect(termPanel).toHaveCSS('background-color', termBgBefore);
    await expect(page.locator('html')).not.toHaveClass(/theme-light/);
    // Entire grid panel (header + outer + card + chart body + caption).
    await expect(previewPanel).toHaveCSS('background-color', 'rgb(247, 247, 249)');
    await expect(canvas).toHaveCSS('background-color', 'rgb(238, 242, 246)');
    const card = page.locator('#anb-grid .grid-stack-item-content').first();
    const chartBody = page.locator('#anb-grid .widget-tile__body').first();
    const caption = page.getByTestId('anb-tg-text');
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(chartBody).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(caption).toHaveCSS('color', 'rgb(26, 26, 26)');

    await dark.locator('.plaque-field-seg__btn[data-value="true"]').click();
    await expect(canvas).toHaveAttribute('data-anb-dark', 'true');
    await expect(previewPanel).toHaveAttribute('data-anb-dark', 'true');
    await expect(canvas).toHaveCSS('background-color', 'rgb(34, 34, 34)');
    await expect(card).toHaveCSS('background-color', 'rgb(50, 50, 50)');
    await expect(chartBody).toHaveCSS('background-color', 'rgb(50, 50, 50)');
    await expect(caption).toHaveCSS('color', 'rgb(220, 220, 220)');
    await expect(optionsPanel).toHaveCSS('background-color', optionsBgBefore);
    await expect(termPanel).toHaveCSS('background-color', termBgBefore);

    // Header moon → entire page including collage (syncs base.darkMode).
    await page.locator('[data-testid="header-theme-toggle"]').click();
    await expect(page.locator('html')).toHaveClass(/theme-light/);
    await expect(dark.locator('.plaque-field-seg__btn--on')).toHaveAttribute(
      'data-value',
      'false',
    );
    await expect(terminal).toContainText('"darkMode": false');
    await expect(canvas).toHaveAttribute('data-anb-dark', 'false');
    await expect(canvas).toHaveCSS('background-color', 'rgb(238, 242, 246)');
    await expect(termPanel).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    await enable.locator('.plaque-field-seg__btn[data-value="false"]').click();
    await expect(enable.locator('.plaque-field-seg__btn--on')).toHaveAttribute(
      'data-value',
      'false',
    );
    await expect(terminal).toContainText('"enableChart": false');
    await expect(canvas).toHaveClass(/anb-canvas--chart-off/);

    await enable.locator('.plaque-field-seg__btn[data-value="true"]').click();
    await expect(canvas).not.toHaveClass(/anb-canvas--chart-off/);
    await expect(terminal).toContainText('"enableChart": true');
  });

  test('vector# fingerprint in bar; actions Reset → Download → Copy', async ({
    page,
  }) => {
    await page.goto('/');
    const vector = page.getByTestId('anb-term-vector');
    await expect(vector).toBeVisible();
    await expect(vector).toHaveValue(/^vector#[0-9a-f]{8}$/);
    const actions = page.locator('.anb-term-actions .panel__action');
    await expect(actions).toHaveCount(3);
    await expect(actions.nth(0)).toHaveAttribute('data-testid', 'anb-term-reset');
    await expect(actions.nth(1)).toHaveAttribute('data-testid', 'anb-term-download');
    await expect(actions.nth(2)).toHaveAttribute('data-testid', 'anb-term-copy');
  });

  test('palette: 5-up grid, caption = chart title (not 2×2)', async ({ page }) => {
    await page.goto('/');
    const palette = page.getByTestId('anb-palette');
    await expect(palette).toBeVisible();
    const items = palette.locator('.anb-palette__item');
    await expect(items).toHaveCount(17);
    const snap = await palette.evaluate((el) => {
      const kids = [...el.querySelectorAll('.anb-palette__item')];
      const y0 = kids[0]?.offsetTop ?? 0;
      const cols = kids.filter((k) => k.offsetTop === y0).length;
      const hints = kids.map((k) => k.querySelector('.anb-palette__hint')?.textContent?.trim() || '');
      const barTitles = kids.flatMap((k) =>
        [...k.querySelectorAll('.widget-tile__title')].map((t) => t.textContent.trim()),
      );
      return {
        cols,
        hints,
        barTitles,
        has2x2: hints.some((h) => /^2[×x]2$/i.test(h)),
      };
    });
    expect(snap.cols).toBe(5);
    expect(snap.has2x2).toBe(false);
    expect(snap.barTitles).toEqual([]);
    expect(snap.hints[0]).toBe('Current status');
    expect(snap.hints[1]).toBe('Testing pyramid');
  });

  test('resize L-brackets sit in gutter outside card (not under title bar)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    const item = page.locator('#anb-grid .grid-stack-item').first();
    await expect(item).toBeVisible();
    const pos = await item.evaluate((el) => {
      const card = el.querySelector('.grid-stack-item-content');
      const bar = el.querySelector('.widget-tile__header, .anb-panel__bar');
      const nw = el.querySelector('.ui-resizable-nw');
      const ne = el.querySelector('.ui-resizable-ne');
      const sw = el.querySelector('.ui-resizable-sw');
      if (!card || !nw || !ne || !sw) {
        return { ok: false, reason: 'missing handles' };
      }
      const c = card.getBoundingClientRect();
      const nwR = nw.getBoundingClientRect();
      const neR = ne.getBoundingClientRect();
      const swR = sw.getBoundingClientRect();
      const barBottom = bar ? bar.getBoundingClientRect().bottom : c.top + 22;
      const cs = getComputedStyle(el.closest('.anb-canvas'));
      const halfGap = parseFloat(cs.getPropertyValue('--anb-card-gap')) / 2;
      // Custom props may stay as calc()/max(); read used ::after size instead.
      const mark = parseFloat(getComputedStyle(nw, '::after').width);
      const radius = parseFloat(getComputedStyle(card).borderRadius);
      return {
        ok: true,
        halfGap,
        mark,
        radius,
        // Handle box at cell edge → outside card by ~half-gap.
        dNwTop: nwR.top - c.top,
        dNeTop: neR.top - c.top,
        dNwLeft: nwR.left - c.left,
        dSwBottom: c.bottom - swR.bottom,
        // Crop-mark (::after) must end before the card edge.
        markEndsBeforeCard: Number.isFinite(mark) && mark <= halfGap - 0.5,
        nwBelowBar: nwR.top >= barBottom - 1,
      };
    });
    expect(pos.ok, JSON.stringify(pos)).toBe(true);
    expect(pos.halfGap).toBeGreaterThan(0);
    expect(pos.markEndsBeforeCard).toBe(true);
    // Outside card (negative offset ≈ half-gap), not flush on the chart.
    expect(pos.dNwTop).toBeLessThan(-2);
    expect(pos.dNeTop).toBeLessThan(-2);
    expect(pos.dNwLeft).toBeLessThan(-2);
    expect(pos.dSwBottom).toBeLessThan(-2);
    expect(Math.abs(pos.dNwTop + pos.halfGap)).toBeLessThan(2);
    expect(Math.abs(pos.dNeTop + pos.halfGap)).toBeLessThan(2);
    // Jar CARD_ARC parity.
    expect(pos.radius).toBe(18);
    // Regression: merge once parked NE/NW under the title bar.
    expect(pos.nwBelowBar).toBe(false);
  });
});
