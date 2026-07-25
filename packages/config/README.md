# @allure-notifications/config

Shared **config.json** schema + builder catalog / canvas presets for line **6.0.\***.

| Export | Role |
|--------|------|
| `ConfigSchema` / `parseConfig` | zod validation (free layout + chrome knobs) |
| `PANEL_CATALOG` / `resolvePanelMeta` | 17 palette slots |
| `DEFAULT_ITEMS` / `CANVAS_PRESETS` / `createDefaultConfig` | SQ-1080 canon + 870/1080/1410 presets |

Chrome defaults (builder SQ-1080): `headerHeight` **22**, `cardGap` **14**, `tilePad` **6**.

```bash
pnpm --filter @allure-notifications/config test
```

Source extracted from hub builder `allure-notifications-builder/js/app.js` (Phase 0 — builder not yet merged to `apps/builder/`). Phase 4 wires builder imports.
