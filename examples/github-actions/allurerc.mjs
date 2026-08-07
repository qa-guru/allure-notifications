/**
 * Native Allure 3 report config for the Marketplace Action example.
 * Notifications run afterwards and never trigger a second generate.
 */
import { defineConfig } from "allure";

export default defineConfig({
  name: "Allure Report",
  output: "./build/reports/allure-report/allureReport",
  plugins: {
    awesome: {},
    dashboard: {},
  },
});
