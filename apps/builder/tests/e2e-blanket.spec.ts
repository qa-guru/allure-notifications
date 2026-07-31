import fs from 'node:fs';
import { test, expect, bindSuiteMeta } from './coverage.fixture.js';

bindSuiteMeta(test, {
  feature: 'builder-ui',
  story: 'Builder e2e blanket',
  layer: 'e2e',
  component: 'builder',
  severity: 'blocker',
});

/** @param {import('@playwright/test').Page} page */
async function terminalChart(page) {
  const raw = await page.getByTestId('anb-terminal').innerText();
  return JSON.parse(raw).base.chart;
}

test.describe('allure-notifications-builder e2e blanket', () => {
  test('formats CB-870 / SQ-1080 / WD-1410 write width×height into terminal', async ({
    page,
  }) => {
    await page.goto('/');
    const select = page.getByTestId('anb-canvas-preset');

    await select.selectOption('870x1080');
    await expect
      .poll(async () => {
        const c = await terminalChart(page);
        return { w: c.width, h: c.height };
      })
      .toEqual({ w: 870, h: 1080 });

    await select.selectOption('1080x1080');
    await expect
      .poll(async () => {
        const c = await terminalChart(page);
        return { w: c.width, h: c.height };
      })
      .toEqual({ w: 1080, h: 1080 });

    await select.selectOption('1410x1080');
    await expect
      .poll(async () => {
        const c = await terminalChart(page);
        return { w: c.width, h: c.height };
      })
      .toEqual({ w: 1410, h: 1080 });
  });

  test('panel bar: select tile enables Copy/Delete; Delete removes item', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();

    const copyBtn = page.getByTestId('anb-btn-copy');
    const deleteBtn = page.getByTestId('anb-btn-delete');
    await expect(copyBtn).toBeDisabled();
    await expect(deleteBtn).toBeDisabled();

    const first = page.locator('#anb-grid .grid-stack-item').first();
    await expect(first).toBeVisible();
    await first.click();

    await expect(copyBtn).toBeEnabled();
    await expect(deleteBtn).toBeEnabled();
    await expect(first.locator('.anb-panel__bar')).toBeVisible();
    await expect(first.locator('[data-anb-action="delete"]')).toBeVisible();
    await expect(first.locator('[data-anb-action="copy"]')).toBeVisible();

    const before = await page.locator('#anb-grid .grid-stack-item').count();
    await deleteBtn.click();
    await expect
      .poll(async () => page.locator('#anb-grid .grid-stack-item').count())
      .toBe(before - 1);
  });

  test('export: Copy config.json writes jar-shaped JSON to clipboard', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    await page.getByTestId('anb-term-copy').click();

    const text = await page.evaluate(() => navigator.clipboard.readText());
    const cfg = JSON.parse(text);
    expect(cfg.telegram).toBeTruthy();
    expect(cfg.base.chart.layout).toBe('free');
    expect(cfg.base.chart.width).toBe(870);
    expect(cfg.base.chart.height).toBe(1080);
    expect(cfg.vector).toMatch(/^vector#[0-9a-f]{8}$/);
  });

  test('layout UX: Clear → empty state; Reset restores 4 tiles', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-reset').click();
    await expect(page.locator('#anb-grid .grid-stack-item')).toHaveCount(4);
    await expect(page.getByTestId('anb-empty')).toBeHidden();

    await page.getByTestId('anb-btn-clear').click();
    await expect(page.locator('#anb-grid .grid-stack-item')).toHaveCount(0);
    await expect(page.getByTestId('anb-empty')).toBeVisible();
    await expect
      .poll(async () => (await terminalChart(page)).items)
      .toEqual([]);

    await page.getByTestId('anb-btn-reset').click();
    await expect(page.locator('#anb-grid .grid-stack-item')).toHaveCount(4);
    await expect(page.getByTestId('anb-empty')).toBeHidden();
    await expect
      .poll(async () => (await terminalChart(page)).items.length)
      .toBe(4);
  });

  test('palette drag-add: currentStatus from palette lands on empty canvas', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('anb-btn-clear').click();
    await expect(page.getByTestId('anb-empty')).toBeVisible();

    const status = page.getByTestId('anb-palette-currentStatus');
    const canvas = page.getByTestId('anb-canvas');
    await expect(status).toBeVisible();

    const statusBox = await status.boundingBox();
    const canvasBox = await canvas.boundingBox();
    expect(statusBox).toBeTruthy();
    expect(canvasBox).toBeTruthy();

    await page.mouse.move(
      statusBox.x + statusBox.width / 2,
      statusBox.y + statusBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(async () => page.locator('#anb-grid .grid-stack-item').count())
      .toBeGreaterThan(0);
    await expect(page.getByTestId('anb-empty')).toBeHidden();
    await expect
      .poll(async () => {
        const items = (await terminalChart(page)).items;
        return items.some((/** @type {{ type: string }} */ i) => i.type === 'currentStatus');
      })
      .toBe(true);
  });

  test('negative: chart-off disables chart group chrome', async ({ page }) => {
    await page.goto('/');
    const enable = page.getByTestId('anb-bool-enableChart');
    const chartGroup = page.getByTestId('anb-group-chart');
    await enable.locator('.plaque-field-seg__btn[data-value="false"]').click();
    await expect(page.getByTestId('anb-canvas')).toHaveClass(/anb-canvas--chart-off/);
    await expect(chartGroup).toHaveClass(/is-disabled/);
    await expect
      .poll(async () => {
        const raw = await page.getByTestId('anb-terminal').innerText();
        return JSON.parse(raw).base.enableChart;
      })
      .toBe(false);
  });
});
