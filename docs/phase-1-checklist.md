# Phase 1 checklist — packages/config

| # | Item | Done |
|---|------|------|
| 1 | zod `ConfigSchema` for `config.json` (free + chrome knobs) | [x] |
| 2 | Extract `PANEL_CATALOG` (17), `DEFAULT_ITEMS`, `CANVAS_PRESETS` | [x] |
| 3 | `createDefaultConfig()` / SQ-1080 defaults (`headerHeight` 22, `cardGap` 14, `tilePad` 6) | [x] |
| 4 | Tests: default export + repo fixtures validate | [x] |
| 5 | Wire builder to import `@qa-guru/allure-notifications-config` | [x] Phase 4 (import map → vendor sync) |

```bash
cd projects/allure-notifications-home/allure-notifications
pnpm install
pnpm --filter @qa-guru/allure-notifications-config test
```
