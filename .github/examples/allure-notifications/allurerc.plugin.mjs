import { defineConfig } from "allure";

export default defineConfig({
  name: "GitHub Actions plugin dogfood",
  output: "./generated-report",
  plugins: {
    awesome: {},
    notifications: {
      import: "@allure-notifications/plugin",
      options: {
        config: "./notifications/config.json",
        mode: process.env.NOTIFICATION_MODE || "dry-run",
        out: "./collage-plugin.png",
        allureFolder: "./dogfood-report",
        allureResultsFolder: "./allure-results",
        reportFile: false,
      },
    },
  },
});
