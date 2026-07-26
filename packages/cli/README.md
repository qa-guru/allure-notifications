# allure-notifications (CLI)

Public npm bin **`allure-notifications`** for line **6.0.\***.

```bash
npx allure-notifications send --config config.json --dry-run
npx allure-notifications send --config config.json --mock --out collage.png
npx allure-notifications send --config config.json --live   # Telegram ADR 008
```

| Flag | Role |
|------|------|
| `send --config <path>` | Required command — load config, collage via `@allure-notifications/core` |
| `--dry-run` | Render PNG; list messengers that *would* send; **no network** (default) |
| `--mock` | Render PNG; record mock deliveries; **no network** |
| `--live` | Live Telegram `sendPhoto` (ADR 008); needs env token |
| `--out <path>` | Write PNG buffer to disk |

Default without `--mock` / `--live` is safe **dry-run**. Live credentials: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID` — see [`docs/telegram-dogfood.md`](../../docs/telegram-dogfood.md).

**Alternate (Allure 3 plugin):** same collage + messengers via `allurerc` `done` hook — [`examples/allurerc.notifications.mjs`](../../examples/allurerc.notifications.mjs) · [`packages/plugin/README.md`](../plugin/README.md). CLI pin stays primary for consumers.

Workspace (pre-publish / local):

```bash
pnpm --filter allure-notifications test
pnpm exec allure-notifications send --config … --dry-run
```
