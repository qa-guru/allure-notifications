import { defineConfig } from "allure";

export default defineConfig({
  name: "GitHub Actions dogfood",
  output: "./allure-report",
  plugins: {
    awesome: {},
    dashboard: {},
  },
});
