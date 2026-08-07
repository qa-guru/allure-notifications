# GitHub Actions — notify after Allure generate

**Primary:** one `allure generate`, then CLI `allure-notifications send` (or the composite Action at repo root).

| Path | When |
|------|------|
| **CLI / Action (primary)** | Post-step after generate — [`cli-notify.yml`](cli-notify.yml) · root [`action.yml`](../../action.yml) |
| **Plugin (legacy alternate)** | Second `allure generate` with `plugins.notifications` — [`plugin-notify.yml`](plugin-notify.yml) |

## Why not two generates?

Allure 3 plugins run inside `generate`. Using `@allure-notifications/plugin` forces a second pass. The CLI reads `summary.json` / results from disk after the first generate — no second pass.

## Marketplace Action

```yaml
- uses: qa-guru/allure-notifications@v6   # after release tag + Marketplace publish
  with:
    config: notifications/config.runtime.json
    mode: ${{ github.event_name == 'pull_request' && 'dry-run' || 'live' }}
  env:
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    # token/chat/topic must already be in the config file (render step)
```

Publish checklist (human):

1. Tag release matching npm pin (e.g. `v6.0.12`)
2. GitHub → Release → Publish this Action to the GitHub Marketplace
3. Consumers pin `@v6` or `@v6.0.12` (never floating `latest`)

## Files

| File | Role |
|------|------|
| [`cli-notify.yml`](cli-notify.yml) | Primary: generate once + Action/CLI send |
| [`allurerc.cli.mjs`](allurerc.cli.mjs) | Report-only Allure config (no notifications plugin) |
| [`plugin-notify.yml`](plugin-notify.yml) | Legacy: two generates + plugin |
| [`allurerc.mjs`](allurerc.mjs) | Plugin example config (notifications in `done`) |
| [`notifications.config.json`](notifications.config.json) | Same schema as CLI `send --config` |

## Local smoke (CLI)

```bash
npm install allure@^3.14.3 allure-notifications@6.0.12
npx allure generate ./allure-results -o ./allure-report
# render config.runtime.json from notifications.config.json + env
npx allure-notifications send --config notifications/config.runtime.json --dry-run --out collage.png
```

`NOTIFICATION_MODE=live` / Action `mode: live` only with `TELEGRAM_*` (ADR 008).

More: [`packages/cli` README](../../packages/cli/README.md) · [`docs/ci-cookbook.md`](../../docs/ci-cookbook.md).
