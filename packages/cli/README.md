# allure-notifications (CLI)

Public npm bin **`@qa-guru/allure-notifications`** for line **6.0.\***.

```bash
npx @qa-guru/allure-notifications@6.0.14 send --config config.json --dry-run
npx @qa-guru/allure-notifications@6.0.14 send --config config.json \
  --allure-folder build/reports/allure-report/allureReport/awesome \
  --allure-results-folder build/allure-results \
  --project Multistack \
  --build-url "$BUILD_URL" \
  --live
```

| Flag | Role |
|------|------|
| `send --config <path>` | Required command — load config, collage via `@qa-guru/allure-notifications-core` |
| `--dry-run` | Render PNG; list messengers that *would* send; **no network** (default) |
| `--mock` | Render PNG; record mock deliveries; **no network** |
| `--live` | Live Telegram `sendPhoto` (ADR 008); needs env token |
| `--out <path>` | Write PNG buffer to disk |
| `--allure-folder`, `--allure-results-folder` | Override report/results paths from the consumer cwd |
| `--project` | Override `base.project` |
| `--report-url`, `--dashboard-url`, `--testops-url`, `--build-url` | Override `base.links` |

Default without `--mock` / `--live` is safe **dry-run**. Live credentials: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID` — see [`docs/telegram-dogfood.md`](../../docs/telegram-dogfood.md).

Relative paths stored in config resolve from the config file directory.
Relative path overrides resolve from the process cwd. Overrides are applied in
memory; the CLI never writes a runtime config or copies credentials into JSON.

**Alternate (Allure 3 plugin):** same collage + messengers via `allurerc` `done` hook — [`examples/allurerc.notifications.mjs`](../../examples/allurerc.notifications.mjs) · [`packages/plugin/README.md`](../plugin/README.md). CLI pin stays primary for consumers.

Workspace (pre-publish / local):

```bash
pnpm --filter @qa-guru/allure-notifications test
pnpm exec allure-notifications send --config … --dry-run
```
