// @ts-check
const { defineConfig } = require('@playwright/test');

const port = Number(process.env.ANB_PORT || 3011);
const baseURL = process.env.ANB_BASE_URL || `http://127.0.0.1:${port}`;

/** Headless unless user explicitly opts into headed (PW_HEADED=1 / PWDEBUG). */
const headed =
  process.env.PW_HEADED === '1' ||
  process.env.PWDEBUG === '1' ||
  process.argv.includes('--headed');
const headless = !headed;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
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
        reuseExistingServer: true,
        timeout: 15_000,
      },
});
