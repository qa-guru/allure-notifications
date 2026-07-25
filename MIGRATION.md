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

Monorepo pin (`docs/allure-notifications/VERSION`) = **6.0.0** (CLI cutover). Product packages ship as npm **`allure-notifications`** + scoped `@allure-notifications/*`. Java **5.0.8** stays in [`legacy/java/`](legacy/java/) for explicit legacy jobs only.

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

Java **5.0.8** Gradle multi-module lives under [`legacy/java/`](legacy/java/) (`cd legacy/java && ./gradlew assemble`). Builder is in `apps/builder/` (Stage E); hub clone may linger until Pages cutover.

**Hub bootstrap (post-G docs sync):** monorepo hub README = **one** clone `allure-notifications`; builder path = `apps/builder/` (stand cwd already). Second hub clone `allure-notifications-builder/` = linger until domain cutover + archive. Checklist row 7 done; **Pages workflow ready** ([`pages-builder.yml`](.github/workflows/pages-builder.yml) + [`docs/pages-cutover.md`](docs/pages-cutover.md)); row 5 domain switch and row 4 archive stay open (manual GitHub UI).

## Phases

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Monorepo shell, MIGRATION, checklist, CI sketch; layout moves per checklist | **done** (Java→`legacy/java` + README banner; Pages workflow ready; domain/archive still open) |
| **1** | `packages/config` — zod schema, PANEL_CATALOG, DEFAULT_ITEMS, SQ-1080 presets | **done** |
| **2** | `packages/pyramid` — palette + geometry SSOT (not dashboard-overrides) | **done** |
| **3** | `packages/core` + `cli` — native PNG, Telegram, dogfood, cookbooks; public **6.0.0** | **done** (core + cli dry-run/mock + live Telegram `--live` / ADR 008 dogfood) |
| **4** | Builder import `@config` (browser SSOT); optional `@pyramid`; full TS / tsgo later | **config done** (import map → vendor sync); `@pyramid` deferred (no UI dep yet); full TS later |
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

## CI surface

See [docs/ci-cookbook.md](docs/ci-cookbook.md): `allure generate` → `allure-notifications send --config … --dry-run`. No `java -jar` on the 6.0 path.

- **6.0 TS:** [`.github/workflows/ci-6.0.yml`](.github/workflows/ci-6.0.yml) — `pnpm install` + `pnpm test` on `feature/6.0*` (Playwright Chromium for `apps/builder` e2e).
- **Builder Pages:** [`.github/workflows/pages-builder.yml`](.github/workflows/pages-builder.yml) — static `apps/builder/` (`index` / `css` / `js` / `vendor`) on `feature/6.0*`; no Telegram secrets. Cutover runbook: [`docs/pages-cutover.md`](docs/pages-cutover.md).
- **5.0.8 Java:** [`.github/workflows/build.yml`](.github/workflows/build.yml) — **master** only; cwd / paths → `legacy/java/`.

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

## Phase 3 notes (cli — Stage D)

`@allure-notifications/cli` (`packages/cli/`):

- Bin: `allure-notifications` → `send --config <path>`
- Collage via `@allure-notifications/core` + `@allure-notifications/config`
- Messengers: **`--dry-run` / `--mock`** (default safe, no network); **`--live`** → Telegram `sendPhoto` (ADR 008)
- Credentials: env `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_TOPIC_ID` (override config; refuse retired chat)
- Optional `--out <png>` writes buffer to disk
- Tests: argv parse + dry-run/mock + mocked live fetch; real network only if `ALLURE_NOTIFICATIONS_LIVE_TEST=1`
- Dogfood runbook: [`docs/telegram-dogfood.md`](docs/telegram-dogfood.md) · fixture `packages/cli/test/fixtures/config.dogfood-cb870.json`
- Verify: `pnpm --filter @allure-notifications/cli test` / root `pnpm test`

## Stage E notes (builder merge)

`@allure-notifications/builder` (`apps/builder/`):

- Merged from hub clone `allure-notifications-builder/` (Playwright + index/js/css/vendor)
- Stand registry cwd → `…/allure-notifications/apps/builder` (`ensure.py allure-notifications-builder`)
- Playwright e2e: CB-870 / SQ-1080 / WD-1410, export, panel bar (`tests/smoke.spec.js`)
- Started `@allure-notifications/config` import via `tests/config-parity.test.mjs` (browser `js/app.js` still local — Phase 4)
- Verify: `pnpm --filter @allure-notifications/builder test` / root `pnpm test`
- **Not in Stage E:** live Telegram, publish, Java→`legacy/java`, VERSION bump, Stage F CI

## Stage F notes (CI)

- Workflow: `.github/workflows/ci-6.0.yml` — Node 20 + pnpm 9.15 + Python 3.12; `pnpm install --frozen-lockfile`; Playwright Chromium; `pnpm test` (config/pyramid/core/cli + builder unit/e2e).
- Triggers: push `feature/6.0*`; PRs into `feature/6.0*` or `master` with path filter on `packages/**` / `apps/**` / pnpm lockfiles / this workflow.
- Java `build.yml` (master) left intact — no shared job / no VERSION bump / no live Telegram in 6.0 CI.
- Cookbook: `docs/ci-cookbook.md` documents real `send --config --dry-run` (+ workspace `pnpm exec` pre-publish).
- **Telegram dogfood (ADR 008):** CLI `--live` + [`docs/telegram-dogfood.md`](docs/telegram-dogfood.md); **not** wired into `ci-6.0.yml`.

## Phase 4 notes (builder → shared packages)

- `@allure-notifications/config/browser` — catalog + presets + `createDefaultConfig` (no zod)
- `apps/builder/scripts/sync-config.mjs` → `vendor/allure-notifications-config/` (real files; stand cannot follow pnpm symlink outside cwd)
- `index.html` import map: `@allure-notifications/config` → vendor `browser.js`
- `js/app.js` imports SSOT; local leftovers = packing / TG preview / vector UI only
- `@allure-notifications/pyramid` — not wired (no geometry constants used in builder UI yet)
- Verify: `pnpm --filter @allure-notifications/builder test` / root `pnpm test`

## Layout move notes (Java → `legacy/java`)

- Moved: `allure-notifications/`, `allure-notifications-api/`, root Gradle files, `gradle/`, `gradlew*`, plus `config/checkstyle` (Gradle rootDir).
- Dogfood JSON/PNG under repo-root `config/` stay put; `config/ci-telegram.json` Allure paths → `legacy/java/…`.
- Build: `cd legacy/java && ./gradlew assemble` (fat jar under `legacy/java/allure-notifications/build/libs/`).
- **Not in this move:** Telegram live dogfood, publish, Pages/archive, VERSION bump, Matrix.

## Pages prep notes (post-G)

- Workflow deploys assembled `_site` from `apps/builder/` (+ `sync-config` for vendor `@config`).
- Artifact includes `CNAME` = current prod hostname `allure-notifications.qa.guru` (checklist also mentions `allure.notifications.qa.guru` — confirm before DNS edits).
- **Manual (GitHub UI):** enable Pages source = GitHub Actions; smoke on `qa-guru.github.io/allure-notifications/`; then move custom domain off `allure-notifications-builder` onto this repo ([`docs/pages-cutover.md`](docs/pages-cutover.md)).
- Archive second repo = **after** domain cutover + separate HQ OK (checklist row 4).

## Next

Post-G gaps: Pages **domain** cutover + archive (workflow ready); VERSION cutover. Telegram dogfood **done**. Do not bump pin without HQ.