# @allure-notifications/cli

Public bin **`allure-notifications`** for line **6.0.\***.

```bash
npx allure-notifications send --config config.json --dry-run
npx allure-notifications send --config config.json --mock --out collage.png
```

| Flag | Role |
|------|------|
| `send --config <path>` | Required command — load config, collage via `@allure-notifications/core` |
| `--dry-run` | Render PNG; list messengers that *would* send; **no network** |
| `--mock` | Render PNG; record mock deliveries; **no network** |
| `--out <path>` | Write PNG buffer to disk |

Stage D: messengers are **dry-run / mock only**. Live Telegram = ADR 008 / Stage F (explicit OK).

```bash
pnpm --filter @allure-notifications/cli test
```
