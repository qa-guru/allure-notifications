# GitHub Actions — notify via Allure 3 plugin

Alternate CI path: collage + messengers run **inside** `allure generate` (`done` hook), not as a separate `allure-notifications send` step.

| Path | When |
|------|------|
| **CLI (primary)** | Post-step after generate — see [ci-cookbook.md](../../docs/ci-cookbook.md) § consumer notify |
| **Plugin (this folder)** | `allure generate --config …` with `plugins.notifications` |

## Files

| File | Role |
|------|------|
| [`allurerc.mjs`](allurerc.mjs) | Allure 3 config: awesome + `@allure-notifications/plugin` |
| [`notifications.config.json`](notifications.config.json) | Same schema as CLI `send --config` |
| [`plugin-notify.yml`](plugin-notify.yml) | Copy-paste consumer workflow template |

Runnable dogfood in this repository (Actions → **Run workflow**):

[`.github/workflows/example-plugin-notify.yml`](../../.github/workflows/example-plugin-notify.yml)

## Why two generate steps?

Allure 3 calls `Plugin.done` **before** report files (including `summary.json`) are flushed to disk. The notifications plugin reads that report from disk (same as CLI), so:

1. Generate the report **without** the plugin (files land on disk).
2. Generate again **with** this `allurerc` — `done` reads the report from step 1, renders collage, dry-runs/sends messengers.

CLI post-step remains the simpler primary path when you only need notify-after-generate.

## Local smoke

```bash
# Pack workspace plugin (or npm i @allure-notifications/plugin@≥6.0.7 after publish)
pnpm install && pnpm --filter @allure-notifications/plugin... build
mkdir -p dist-pack
# pnpm pack rejects --filter (Unknown option: recursive); pack from package dir
pnpm --filter @allure-notifications/plugin exec pnpm pack --pack-destination ./dist-pack

rm -rf /tmp/an-plugin-smoke && mkdir /tmp/an-plugin-smoke && cd /tmp/an-plugin-smoke
npm init -y && npm install allure@^3.14.3 "$REPO/dist-pack"/allure-notifications-plugin-*.tgz
cp -R "$REPO/packages/core/test/fixtures/dogfood-results" ./allure-results
mkdir -p examples/github-actions
cp "$REPO/examples/github-actions/"allurerc.mjs \
   "$REPO/examples/github-actions/"notifications.config.json \
   examples/github-actions/

npx allure generate ./allure-results -o ./allure-report
NOTIFICATION_MODE=dry-run npx allure generate ./allure-results \
  --config ./examples/github-actions/allurerc.mjs
# → collage-plugin.png
```

(`$REPO` = path to this repository root.)

`NOTIFICATION_MODE=live` only with `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_TOPIC_ID` (ADR 008).

More: [`packages/plugin/README.md`](../../packages/plugin/README.md) · [`docs/ci-cookbook.md`](../../docs/ci-cookbook.md).
