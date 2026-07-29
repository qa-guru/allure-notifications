// @ts-check
const path = require('node:path');
const { defineConfig } = require('@playwright/test');

// Default 13011: avoid reusing stale :3011 hub clone (cwd mismatch vs apps/builder).
// Prod stand remains ensure.py → :3011 when cwd is apps/builder.
const port = Number(process.env.ANB_PORT || 13011);
const baseURL = process.env.ANB_BASE_URL || `http://127.0.0.1:${port}`;

/** Headless unless user explicitly opts into headed (PW_HEADED=1 / PWDEBUG). */
const headed =
  process.env.PW_HEADED === '1' ||
  process.env.PWDEBUG === '1' ||
  process.argv.includes('--headed');
const headless = !headed;

const allureResultsDir =
  process.env.ALLURE_RESULTS_DIR ||
  path.join(__dirname, '..', '..', 'allure-results');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ...(process.env.CI ? [['html', { open: 'never' }]] : []),
    ['allure-playwright', { resultsDir: allureResultsDir }],
  ],
  use: {
    baseURL,
    headless,
    launchOptions: {
      headless,
      args: headless ? ['--headless=new'] : [],
    },
    trace: 'on-first-retry',
  },
  webServer: process.env.ANB_NO_WEBSERVER
    ? undefined
    : {
        command: `python -m http.server ${port}`,
        url: baseURL,
        // Default port 13011 avoids stale hub clone on :3011; reuse ensure.py stand when present.
        reuseExistingServer: true,
        timeout: 15_000,
      },
});
