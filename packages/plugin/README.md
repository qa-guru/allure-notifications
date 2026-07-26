# @allure-notifications/plugin

Allure 3 **plugin** for line **6.0.\*** — thin wrapper over `@allure-notifications/core` + CLI messengers.

Etalon: [`@allurereport/plugin-slack`](https://github.com/allure-framework/allure3/blob/main/packages/plugin-slack/src/plugin.ts) `done` hook.

## Install

```bash
npm add @allure-notifications/plugin
# workspace: already in pnpm packages/plugin
```

## allurerc

```js
import { defineConfig } from "allure";

export default defineConfig({
  name: "Allure Report",
  output: "./allure-report",
  plugins: {
    awesome: {},
    notifications: {
      import: "@allure-notifications/plugin",
      options: {
        config: "./config/notifications.json",
        mode: "dry-run", // "dry-run" | "mock" | "live" — default dry-run
      },
    },
  },
});
```

Full example: [`examples/allurerc.notifications.mjs`](../../examples/allurerc.notifications.mjs).

## Options

| Option | Type | Default | Role |
|--------|------|---------|------|
| `config` | `string \| object` | **required** | Path to `config.json` or inline CLI schema |
| `mode` | `"dry-run" \| "mock" \| "live"` | `dry-run` | Messengers; live = Telegram ADR 008 |
| `out` | `string` | — | Write collage PNG to disk |
| `allureFolder` | `string` | `context.output` if unset in config | Report dir for summary |
| `allureResultsFolder` | `string` | from config | Results for analytics |
| `reportFile` | `string \| false` | `allure-notifications-collage.png` | Attach PNG into report; `false` to skip |

Pipeline in `done`: `parseConfig` → `loadReportAnalytics` / `renderCollagePng` (core, `@napi-rs/canvas`) → `deliver` (CLI messengers). **No network** unless `mode: "live"`.

## Verify

```bash
pnpm --filter @allure-notifications/plugin test
pnpm --filter @allure-notifications/plugin typecheck
```
