/**
 * Example allurerc — Allure 3 + @allure-notifications/plugin (Phase 5).
 *
 * Alternate to the CLI post-step (CLI pin stays primary for consumers):
 *   npx allure-notifications send --config ./config/ci-telegram.json --dry-run
 *
 * Usage (after `pnpm add allure @allure-notifications/plugin`; npm public from 6.0.5):
 *   npx allure generate ./allure-results --config ./examples/allurerc.notifications.mjs
 *
 * Default mode is dry-run (collage + messenger plan, no network).
 * Set mode: "live" only with TELEGRAM_* credentials (ADR 008).
 * Docs: packages/plugin/README.md · docs/ci-cookbook.md · docs/telegram-dogfood.md
 * GitHub Actions (plugin): examples/github-actions/ · .github/workflows/example-plugin-notify.yml
 */
import { defineConfig } from "allure";

export default defineConfig({
  name: "Allure Report",
  output: "./allure-report",
  plugins: {
    awesome: {},
    notifications: {
      import: "@allure-notifications/plugin",
      options: {
        // Same JSON schema as: npx allure-notifications send --config …
        config: "./config/ci-telegram.json",
        mode: "dry-run",
        // mode: "mock",
        // mode: "live",
        // out: "./collage.png",
      },
    },
  },
});
