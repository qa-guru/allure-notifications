// @ts-check
/**
 * When ANB_COVERAGE=1: istanbul-instrument ES modules (Playwright V8 coverage
 * does not support type=module), fulfill /js/app.js + /js/phrases.js, merge
 * window.__coverage__ into ANB_COVERAGE_OUT (Istanbul JSON map).
 */
const fs = require('node:fs');
const path = require('node:path');
const playwright = require('@playwright/test');
const { createInstrumenter } = require('istanbul-lib-instrument');
const libCoverage = require('istanbul-lib-coverage');

const base = playwright.test;
const expect = playwright.expect;

const enabled = process.env.ANB_COVERAGE === '1';
const outPath =
  process.env.ANB_COVERAGE_OUT ||
  path.join(__dirname, '../../../coverage/builder/istanbul-map.json');

const builderRoot = path.join(__dirname, '..');
const appPath = path.join(builderRoot, 'js/app.js');
const phrasesPath = path.join(builderRoot, 'js/phrases.js');

/** @type {Map<string, string>} */
const instrumented = new Map();

function ensureInstrumented() {
  if (instrumented.size) return;
  const instrumenter = createInstrumenter({
    esModules: true,
    produceSourceMap: false,
    coverageVariable: '__coverage__',
  });
  for (const filePath of [appPath, phrasesPath]) {
    const source = fs.readFileSync(filePath, 'utf8');
    instrumented.set(
      filePath,
      instrumenter.instrumentSync(source, filePath),
    );
  }
}

function mergeCoverage(cov) {
  if (!cov || typeof cov !== 'object') return;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const map = libCoverage.createCoverageMap(
    fs.existsSync(outPath)
      ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
      : {},
  );
  map.merge(cov);
  fs.writeFileSync(outPath, JSON.stringify(map.toJSON()));
}

const test = base.extend({
  page: async ({ page }, use) => {
    if (enabled) {
      ensureInstrumented();
      await page.route('**/js/app.js', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/javascript; charset=utf-8',
          body: instrumented.get(appPath),
          headers: { 'cache-control': 'no-store' },
        });
      });
      await page.route('**/js/phrases.js', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/javascript; charset=utf-8',
          body: instrumented.get(phrasesPath),
          headers: { 'cache-control': 'no-store' },
        });
      });
    }
    await use(page);
    if (enabled) {
      const cov = await page.evaluate(() => globalThis.__coverage__ || null);
      mergeCoverage(cov);
    }
  },
});

module.exports = { test, expect };
