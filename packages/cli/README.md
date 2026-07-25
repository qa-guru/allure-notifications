# @allure-notifications/cli

Public bin **`allure-notifications`** for line **6.0.\***.

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

```bash
pnpm --filter @allure-notifications/cli test
```
