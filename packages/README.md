# packages/

TypeScript workspace packages for line **6.0.\***.

| Package | Role | Phase |
|---------|------|-------|
| [`config`](config/) | zod schema, PANEL_CATALOG, DEFAULT_ITEMS, canvas presets | **1 done** |
| [`pyramid`](pyramid/) | palette + rounded-tier geometry SSOT | **2 done** |
| `core` | report → native PNG → messengers | 3 |
| `cli` | `allure-notifications send` | 3 |
| `plugin` | optional thin Allure 3 plugin over `core` | 5 |

See [../MIGRATION.md](../MIGRATION.md).
