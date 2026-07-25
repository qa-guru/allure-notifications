# Migration: 5.0.* Java → 6.0.* TypeScript

SSOT plan (workspace): `.cursor/plans/an_ts_migration_prompt_5f4be014.plan.md`  
Hub: `projects/allure-notifications-home/`  
Upstream: [qa-guru/allure-notifications](https://github.com/qa-guru/allure-notifications)

## Versions

There is **no 5.1** line. Product versions jump **5.0.\* (Java)** → **6.0.\* (TypeScript)**.

| Line | Stack | Status |
|------|-------|--------|
| **5.0.\*** | Java Gradle fat jar (current **5.0.8**) | **Current / legacy freeze** — bugfix / security only; **no TypeScript** |
| **6.0.\*** | TypeScript monorepo (CLI + builder + packages) | **Next line** — skeleton on `feature/6.0-phase-0-1`; not on `master` yet |

Pin in monorepo docs (`docs/allure-notifications/VERSION`) stays **5.0.8** until CLI dogfood cutover. Root `package.json` version **6.0.0** marks the TS line; do not publish / cut consumers until Phase 3 dogfood.

## Public product (locked)

Standalone **CLI** + **web builder**. Not an Allure 3 plugin, not a Jenkins plugin, not an HTML patcher.

```bash
npx allure generate
npx allure-notifications send --config config.json
```

| | Do |
|--|----|
| TS CLI post-step after `allure generate` | **yes** — main 6.0 runtime |
| Builder on GitHub Pages | **yes** — `apps/builder/` |
| Native collage PNG | **yes** — `packages/core` (Canvas/Sharp/Skia TBD); never Playwright for production PNG |
| `packages/pyramid` SSOT (colors + geometry) | **yes** |
| Thin A3 plugin wrapper | later optional (Phase 5) |
| `dashboard-overrides` / HTML inject in npm | **no** — private zds stack / upstream Allure only |
| Merge into `allure-framework/allure3` | **no** |

## Target tree

```text
allure-notifications/                 # version line 6.0.*
  packages/
    config/          # zod, PANEL_CATALOG, DEFAULT_ITEMS, canvas presets
    pyramid/         # palette + CORNER_RATIO / TIER_GAP / rounded tiers (SSOT)
    core/            # read A3 summary/results → native collage PNG → messengers
    cli/             # bin: allure-notifications send
    plugin/          # optional later — thin Plugin over core
  apps/
    builder/         # was qa-guru/allure-notifications-builder; Pages CNAME
  legacy/
    java/            # 5.0.* freeze (Gradle multi-module)
  pnpm-workspace.yaml
  package.json       # "version": "6.0.0"
  MIGRATION.md
  docs/
    ci-cookbook.md
    phase-0-checklist.md
```

Today (pre-move): Java modules at repo root (`allure-notifications/`, `allure-notifications-api/`); builder lives in a **second** repo clone under the hub (`allure-notifications-builder/`). Phase 0 documents the moves; physical merge is gated by [docs/phase-0-checklist.md](docs/phase-0-checklist.md).

## Phases

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Monorepo shell, MIGRATION, checklist, CI sketch; no big-bang move | **done** (layout moves deferred — see phase-0-checklist) |
| **1** | `packages/config` — zod schema, PANEL_CATALOG, DEFAULT_ITEMS, SQ-1080 presets | **done** |
| **2** | `packages/pyramid` — palette + geometry SSOT (not dashboard-overrides) | **done** |
| **3** | `packages/core` + `cli` — native PNG, Telegram, dogfood, cookbooks; public **6.0.0** | **core done** (Stage C); cli = Stage D |
| **4** | Builder full TS; import `@config` / `@pyramid`; typescript@7 / tsgo in CI | pending |
| **5** | Optional thin `@allurereport/plugin-api` wrapper over `core` | optional |

## Anti-hack rules

1. `npx allure-notifications send` must not touch awesome/dashboard HTML.
2. Production PNG without Playwright.
3. Builder + CLI share one `@config`.
4. Pyramid numbers live in one `@pyramid`.
5. README: 5.0 Java legacy / 6.0 TypeScript; standalone utility.
6. Stand `:3011` + Pages stay live across the builder merge.

## Out of scope

- Shipping `dashboard-overrides.js` / `inject-allure-pyramid-colors.mjs` in npm
- Merge into `allure-framework/allure3`
- Jenkins Plugin Manager
- collage-builder (`:3010`)
- Allure 2 compat (unless explicitly requested later)
- Deleting `legacy/java` before 6.0 dogfood parity
- Big-bang rewrite without this file

## CI surface (sketch)

See [docs/ci-cookbook.md](docs/ci-cookbook.md): `allure generate` → `allure-notifications send`. No `java -jar` on the 6.0 path.

## Phase 1 notes

`@allure-notifications/config` (`packages/config/`):

- zod `ConfigSchema` — `base.chart` free layout + chrome knobs (`headerHeight` / `cardGap` / `tilePad`)
- `PANEL_CATALOG` (17), `DEFAULT_ITEMS` (SQ-1080 7-tile), `CANVAS_PRESETS` (870/1080/1410×1080), `createDefaultConfig()`
- Extracted from hub builder `allure-notifications-builder/js/app.js` (builder still has a local copy until Phase 4 / `apps/builder/` merge)
- Verify: `pnpm --filter @allure-notifications/config test`

## Phase 2 notes

`@allure-notifications/pyramid` (`packages/pyramid/`):

- Palette mirrors monorepo SSOT `stacks/java-spring/tests/allure/pyramid-layers.json`
- `unit` light/dark = pie `STATUS_COLORS.passed` / `#94ca66`
- Geometry: `CORNER_RATIO=0.18`, `TIER_GAP_RATIO=0.11` (+ `tierGapPx` / `tierCornerRadius`)
- Not shipped: `dashboard-overrides` / HTML inject
- Verify: `pnpm --filter @allure-notifications/pyramid test` and
  (from monorepo root) `python scripts/pyramid_palette_sync.py --check`

## Phase 3 notes (core — Stage C)

`@allure-notifications/core` (`packages/core/`):

- Native collage PNG via **`@napi-rs/canvas`** (locked in package README) — not Playwright
- Depends on `@allure-notifications/config` + `@allure-notifications/pyramid`
- Allure 3 `summary.json` (`stats`) + `*-result.json` → `ReportAnalytics` → free-layout collage
- Panels Stage C: **pie** / **testingPyramid** / **durations** (+ empty-state stubs)
- Tests: fixture → PNG; unit green `#94ca66`; pixel/ahash vs
  monorepo `docs/allure-notifications/canon/collage-cb870-free-dogfood-5.0.3.png`
- Verify: `pnpm --filter @allure-notifications/core test` / root `pnpm test`
- **Not in Stage C:** `packages/cli`, messengers / Telegram dogfood, `apps/builder`

## Next

**Stage D** — `packages/cli` (`send --config` dry-run/mock + tests).
Ask before starting Stage D / remaining Phase 3 (Telegram dogfood).
