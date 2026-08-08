/**
 * Legacy plugin capability example.
 *
 * Prefer allurerc.mjs + the Marketplace Action. The plugin reads an existing
 * report during a later generate pass because Allure flushes report files
 * after Plugin.done.
 */
import { defineConfig } from "allure";

const mode = process.env.NOTIFICATION_MODE || "dry-run";

export default defineConfig({
  name: "Allure Report with notifications plugin",
  output: "./build/reports/allure-report/allureReport",
  plugins: {
    awesome: {},
    notifications: {
      import: "@qa-guru/allure-notifications-plugin",
      options: {
        config: "./examples/github-actions/notifications/config.json",
        mode,
        out: "./collage-plugin.png",
        allureFolder: "./build/reports/allure-report/allureReport/awesome",
        allureResultsFolder: "./build/allure-results",
      },
    },
  },
});
