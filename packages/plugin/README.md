# @allure-notifications/plugin

Allure 3 **plugin** for line **6.0.\*** — thin wrapper over `@allure-notifications/core` + CLI messengers.

Runs in the Allure 3 `done` hook (etalon: [`@allurereport/plugin-slack`](https://github.com/allure-framework/allure3/blob/main/packages/plugin-slack/src/plugin.ts)). Same collage + messenger pipeline as the CLI; **CLI remains the primary consumer path**.

## Install

```bash
npm add allure @allure-notifications/plugin
# workspace: already in pnpm packages/plugin
```

> **npm status:** package lands on the public registry with release **6.0.5**. Until then use the workspace / git dependency, or keep the CLI pin (`npx allure-notifications@6.0.4`).

## allurerc

Full copy-paste example: [`examples/allurerc.notifications.mjs`](../../examples/allurerc.notifications.mjs).

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
        // Same JSON schema as: npx allure-notifications send --config …
        config: "./config/notifications.json",
        mode: "dry-run", // "dry-run" | "mock" | "live" — default dry-run
        // out: "./collage.png",
      },
    },
  },
});
```

```bash
npx allure generate ./allure-results --config ./examples/allurerc.notifications.mjs
```

The plugin fires **after** report generation (`done`). Point `options.config` at the same `config.json` the CLI would use.

## Options

| Option | Type | Default | Role |
|--------|------|---------|------|
| `config` | `string \| object` | **required** | Path to `config.json` (cwd-relative) or inline object — **same schema as CLI** `send --config` |
| `mode` | `"dry-run" \| "mock" \| "live"` | `dry-run` | Messenger delivery mode (see below) |
| `out` | `string` | — | Write collage PNG to disk |
| `allureFolder` | `string` | `context.output` if unset in config | Report dir for `summary.json` |
| `allureResultsFolder` | `string` | from config | Results for analytics |
| `reportFile` | `string \| false` | `allure-notifications-collage.png` | Attach PNG into the report; `false` to skip |

Pipeline in `done`: `parseConfig` → `loadReportAnalytics` / `renderCollagePng` (core, `@napi-rs/canvas`) → `deliver` (CLI messengers). **No network** unless `mode: "live"`.

## dry-run vs live (and CLI)

| Path | Safe default | Live Telegram |
|------|--------------|---------------|
| **CLI (primary)** | `npx allure-notifications send --config … --dry-run` | explicit `--live` + `TELEGRAM_*` |
| **Plugin (alternate)** | `mode: "dry-run"` (default) | `mode: "live"` + same env |

| `mode` | Behavior |
|--------|----------|
| `dry-run` | Render PNG; list messengers that *would* send; **no network** |
| `mock` | Render PNG; record mock deliveries; **no network** |
| `live` | Live Telegram `sendPhoto` (ADR 008); needs `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_TOPIC_ID` |

Equivalent CLI:

```bash
# after allure generate (no plugin)
npx allure-notifications send --config ./config/notifications.json --dry-run
npx allure-notifications send --config ./config/notifications.json --live
```

Dogfood / credentials: [`docs/telegram-dogfood.md`](../../docs/telegram-dogfood.md). CI cookbook: [`docs/ci-cookbook.md`](../../docs/ci-cookbook.md).

## Verify

```bash
pnpm --filter @allure-notifications/plugin test
pnpm --filter @allure-notifications/plugin typecheck
```
