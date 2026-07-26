/**
 * Example allurerc — Allure 3 + @allure-notifications/plugin (Phase 5).
 *
 * Usage (after `pnpm add allure @allure-notifications/plugin`):
 *   npx allure generate ./allure-results --config ./examples/allurerc.notifications.mjs
 *
 * Default mode is dry-run (collage + messenger plan, no network).
 * Set mode: "live" only with TELEGRAM_* credentials (ADR 008).
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
