/**
 * allurerc for the GitHub Actions plugin example.
 *
 * Notifications run inside `allure generate` (plugin `done` hook) — not as a
 * separate `allure-notifications send` post-step.
 *
 * Important (Allure 3 flush timing):
 *   Plugin.done runs before report files are on disk. Point `allureFolder` at a
 *   report that already exists (generate once without the plugin, then again
 *   with this config) — see examples/github-actions/README.md.
 *
 * Mode from env:
 *   NOTIFICATION_MODE=dry-run|mock|live  (default dry-run)
 *
 * Usage:
 *   npx allure generate ./allure-results -o ./allure-report
 *   NOTIFICATION_MODE=dry-run npx allure generate ./allure-results \
 *     --config ./examples/github-actions/allurerc.mjs
 */
import { defineConfig } from "allure";

const mode = process.env.NOTIFICATION_MODE || "dry-run";

export default defineConfig({
  name: "Allure Report",
  output: "./allure-report",
  plugins: {
    awesome: {},
    notifications: {
      import: "@allure-notifications/plugin",
      options: {
        config: "./examples/github-actions/notifications.config.json",
        mode,
        out: "./collage-plugin.png",
        // Existing report from the prior generate step (cwd-relative)
        allureFolder: "./allure-report",
        allureResultsFolder: "./allure-results",
      },
    },
  },
});
