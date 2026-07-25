# packages/

TypeScript workspace packages for line **6.0.\***.

| Package | Role | Phase |
|---------|------|-------|
| [`config`](config/) | zod schema, PANEL_CATALOG, DEFAULT_ITEMS, canvas presets | **1 done** |
| [`pyramid`](pyramid/) | palette + rounded-tier geometry SSOT | **2 done** |
| [`core`](core/) | report → native PNG (`@napi-rs/canvas`) | **3 / Stage C done** |
| `cli` | `allure-notifications send` | 3 / Stage D |
| `plugin` | optional thin Allure 3 plugin over `core` | 5 |

See [../MIGRATION.md](../MIGRATION.md).
