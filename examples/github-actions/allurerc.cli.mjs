/**
 * allurerc for the CLI / Action example — report only, no notifications plugin.
 * Telegram is a separate `allure-notifications send` (or composite Action) step.
 */
import { defineConfig } from "allure";

export default defineConfig({
  name: "Allure Report",
  output: "./allure-report",
  plugins: {
    awesome: {},
  },
});
