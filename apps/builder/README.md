# @allure-notifications/builder

Full `config.json` configurator for [allure-notifications](https://github.com/qa-guru/allure-notifications) (base · messengers · links · chart/collage).

Merged into the 6.0 monorepo as `apps/builder/` (Stage E). Pages deploy from this tree: [`.github/workflows/pages-builder.yml`](../../.github/workflows/pages-builder.yml) · cutover: [`docs/pages-cutover.md`](../../docs/pages-cutover.md). Legacy Pages repo (until domain move): [qa-guru/allure-notifications-builder](https://github.com/qa-guru/allure-notifications-builder).

**Not** collage-builder — no `cb-*` classes; collage-builder is legacy and not developed further. See [CANON.md](CANON.md).

## Canvas presets

Only: **870×1080** · **1080×1080** · **1410×1080**. No 1024×1280.

## Config + pyramid SSOT

| Package | Role | Vendor sync |
|---------|------|-------------|
| `@allure-notifications/config` | catalog / presets / `createDefaultConfig` (browser, no zod) | `pnpm run sync-config` → `vendor/allure-notifications-config/` |
| `@allure-notifications/pyramid` | `CORNER_RATIO` / `TIER_GAP_RATIO` + layer palette (`unit` = `#94ca66`) | `pnpm run sync-pyramid` → `vendor/allure-notifications-pyramid/` |

Stand/`http.server` cannot follow pnpm symlinks outside `apps/builder`, so sync copies real files. `index.html` import map maps both bare specifiers → vendor. `js/app.js` injects `--layer-*` + geometry ratios from `@pyramid`. UI-only packing (`DEFAULT_TILE_W`, `PACK_*`, `WT_BAR_BASELINE`) stays local. Parity: `tests/config-parity.test.mjs` · `tests/pyramid-parity.test.mjs`.

## Stand

```bash
# from monorepo root
python scripts/stands/ensure.py allure-notifications-builder
# → http://localhost:3011/
```

HTTP required (`header.js` fetches `vendor/design-system/templates/header.html`). Reuse port **3011** — do not kill/restart while chat is active.

## Layout

| Path | Role |
|------|------|
| `index.html` | Shell + header + options + collage editor + TG preview + terminal |
| `css/app.css` | Local `anb-*` only |
| `js/app.js` | Options + free-layout → live JSON + messenger mirror + Copy/Download/Reset |
| `vendor/design-system/` | Pinned DS assets (read-only) |
| `MANIFEST.json` | Pin inventory + policy |
| `CANON.md` | SQ-1080 default + free export shape |

## Tests

```bash
# from monorepo root (allure-notifications nested)
pnpm --filter @allure-notifications/builder test
# or root:
pnpm test
```

- `tests/config-parity.test.mjs` — import `@allure-notifications/config` (SQ-1080 / presets / catalog)
- `tests/pyramid-parity.test.mjs` — import `@allure-notifications/pyramid` (geometry / palette / vendor)
- `tests/smoke.spec.js` — Playwright: header, zones, Reset → free `items`, CB-870 / SQ-1080 / WD-1410, export, panel bar
- `tests/dogfood_jar.py` — needs jar + `build/pyramid-showcase`; skip unless `ANB_DOGFOOD_REQUIRED=1`

## Prod

- **URL:** [https://allure.notifications.qa.guru/](https://allure.notifications.qa.guru/)
- **Source (until Pages cutover):** `qa-guru/allure-notifications-builder` `main`
- **Target:** serve from this `apps/builder/` (checklist row 5)
