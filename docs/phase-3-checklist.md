# Phase 3 checklist — packages/core (+ cli later)

| # | Item | Done |
|---|------|------|
| 1 | Native PNG backend locked (`@napi-rs/canvas`) in package README | [x] |
| 2 | Depend on `@allure-notifications/config` + `@pyramid` | [x] |
| 3 | A3 summary + `*-result.json` → `ReportAnalytics` | [x] |
| 4 | Free-layout collage: pie / testingPyramid / durations + card chrome | [x] |
| 5 | Unit/integration: fixture → PNG; `#94ca66`; pixel/hash vs canon | [x] |
| 6 | `pnpm test` green (config + pyramid + core) | [x] |
| 7 | `packages/cli` `send --config` dry-run/mock | [ ] Stage D |
| 8 | Telegram dogfood | [ ] Stage F / OK |

```bash
cd projects/allure-notifications-home/allure-notifications
pnpm install
pnpm test
pnpm --filter @allure-notifications/core test
```

Canon: monorepo `docs/allure-notifications/canon/CANON.md`.
Pin `docs/allure-notifications/VERSION` stays **5.0.8**.
