# Migration: 5.0.* Java → 6.0.* TypeScript

SSOT plan (workspace): `.cursor/plans/an_ts_migration_prompt_5f4be014.plan.md`  
Hub: `projects/allure-notifications-home/`  
Upstream: [qa-guru/allure-notifications](https://github.com/qa-guru/allure-notifications)

## Versions (locked)

There is **no 5.1** line. Historical Java A3 MVP stays at **5.0.8**; product continues on **6.\***.

| Line | Allure | Stack | Status |
|------|--------|-------|--------|
| **4.\*** | Allure 2 | Java | Historical A2 |
| **5.\*** | Allure 3 | Java MVP (Gradle fat jar **5.0.8**) | **Archived** on branch [`legacy/java-5.0.8`](https://github.com/qa-guru/allure-notifications/tree/legacy/java-5.0.8/legacy/java) — **keep forever on that branch**; release [v5.0.8](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.8); bugfix / security only; **no TypeScript**; **not in-tree on `master`** |
| **6.\*** | Allure 3 | TypeScript / typescript-go · CLI · builder · A3 plugin · AI | **Product** on `master` — pin `docs/allure-notifications/VERSION` (**6.2.2**) |

Monorepo pin = **6.2.2**. Product packages: npm **`@qa-guru/allure-notifications`** + scoped `@qa-guru/allure-notifications-*` (CLI + plugin aligned at **6.2.2**). Collage palette/geometry: **`@qa-guru/allure-report-kit/collage`** (≥0.3.3); `@qa-guru/allure-notifications-pyramid` removed.

## Public product 6.\* (locked)

- Standalone **CLI** + **web builder** (included)
- **Allure 3 plugin** (thin over `core`)
- **TypeScript / typescript-go**
- **AI features** (incremental)
- Not a Jenkins plugin, not an HTML patcher

```bash
npx allure generate
npx allure-notifications send --config config.json
```

| | Do |
|--|----|
| TS CLI post-step after `allure generate` | **yes** — main 6.\* runtime |
| Builder on GitHub Pages | **yes** — `apps/builder/` |
| Native collage PNG | **yes** — `packages/core` (`@napi-rs/canvas`); never Playwright for production PNG |
| kit collage palette + geometry (`@qa-guru/allure-report-kit`) | **yes** |
| Thin A3 plugin wrapper | **yes** — in-line for 6.\* (`packages/plugin`) |
| AI features | **yes** — in-line for 6.\* (by OK) |
| `dashboard-overrides` / HTML inject in npm | **no** — private zds stack / upstream Allure only |
| Merge into `allure-framework/allure3` | **no** |
| Delete archive branch / erase 5.0 release | **no** — historical keep on `legacy/java-5.0.8` + tag `v5.0.8` |

## Target tree

```text
allure-notifications/                 # version line 6.0.*
  packages/
    config/          # zod, PANEL_CATALOG, DEFAULT_ITEMS, canvas presets
    core/            # read A3 summary/results → native collage PNG → messengers (kit /collage palette)
    cli/             # bin: allure-notifications send
    plugin/          # Allure 3 plugin — thin over core (6.*)
  apps/
    builder/         # was qa-guru/allure-notifications-builder; Pages CNAME
  pnpm-workspace.yaml
  package.json       # "version": "6.0.*"
  MIGRATION.md
  docs/
    ci-cookbook.md
    phase-0-checklist.md
```

Java **5.0.8** Gradle multi-module is **archived** on branch [`legacy/java-5.0.8`](https://github.com/qa-guru/allure-notifications/tree/legacy/java-5.0.8/legacy/java) (`git checkout legacy/java-5.0.8 && cd legacy/java && ./gradlew assemble`). Jar: [release v5.0.8](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.8). Builder is in `apps/builder/` (Stage E); hub clone may linger until Pages cutover.

**Hub bootstrap (post-G docs sync):** monorepo hub README = **one** clone `allure-notifications`; builder path = `apps/builder/` (stand cwd already). Second hub clone `allure-notifications-builder/` = linger until domain cutover + archive. Checklist row 7 done; **Pages workflow ready** ([`pages-builder.yml`](.github/workflows/pages-builder.yml) + [`docs/pages-cutover.md`](docs/pages-cutover.md)); row 5 domain switch and row 4 archive stay open (manual GitHub UI).

## Phases

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Monorepo shell, MIGRATION, checklist, CI sketch; layout moves per checklist | **done** (Java→`legacy/java` + README banner; Pages workflow ready; domain/archive still open) |
| **1** | `packages/config` — zod schema, PANEL_CATALOG, DEFAULT_ITEMS, SQ-1080 presets | **done** |
| **2** | kit collage palette + testing-pyramid geometry (removed `packages/pyramid`) | **done** |
| **3** | `packages/core` + `cli` — native PNG, Telegram, dogfood, cookbooks; public **6.0.0** | **done** (core + cli dry-run/mock + live Telegram `--live` / ADR 008 dogfood) |
| **4** | Builder import `@config` (browser SSOT); kit `/collage` vendor; full TS / typescript@7 | **done** (`@config` + `@qa-guru/allure-report-kit/collage` import map → vendor sync); **full TS done** (`apps/builder/src` → emit `js/`, toolchain `typescript@7`) |
| **5** | Thin `@allurereport/plugin-api` wrapper over `core` (`packages/plugin`) | **done** (`@qa-guru/allure-notifications-plugin` — `done` hook; dry-run default) |

## Anti-hack rules

1. `npx allure-notifications send` must not touch awesome/dashboard HTML.
2. Production PNG without Playwright.
3. Builder + CLI share one `@config`.
4. Collage palette/geometry live in `@qa-guru/allure-report-kit/collage` (not a notifications package).
5. README: 4.\* A2/Java · 5.\* A3/Java MVP historical keep · 6.\* A3 TS+builder+plugin+AI.
6. Stand `:3011` + Pages stay live across the builder merge.

## Out of scope

- Shipping `dashboard-overrides.js` / `inject-allure-pyramid-colors.mjs` in npm
- Merge into `allure-framework/allure3`
- Jenkins Plugin Manager
- collage-builder (`:3010`)
- Reviving **4.\*** / Allure 2 as a product line (historical only)
- Erasing 5.0 history (tag/release `v5.0.8` or archive branch `legacy/java-5.0.8`) — forbidden
- Big-bang rewrite without this file

## CI surface

See [docs/ci-cookbook.md](docs/ci-cookbook.md): **primary** = `allure generate` → `allure-notifications send --config … --dry-run`. **Alternate** = Allure 3 plugin in `allurerc` ([`examples/allurerc.notifications.mjs`](examples/allurerc.notifications.mjs) · [`packages/plugin/README.md`](packages/plugin/README.md)). No `java -jar` on the 6.0 path.

- **6.0 TS:** [`.github/workflows/ci-6.0.yml`](.github/workflows/ci-6.0.yml) — `pnpm install` + `pnpm typecheck` (`typescript@7`) + `pnpm test` on `master` + `feature/6.0*` + `feature/builder-ts` (Playwright Chromium for `apps/builder` e2e).
- **Builder Pages:** [`.github/workflows/pages-builder.yml`](.github/workflows/pages-builder.yml) — build `apps/builder` TS → `js/`, sync vendor, deploy static (`index` / `css` / `js` / `vendor`) on `master` + `feature/6.0*` + `feature/builder-ts`; no Telegram secrets. Cutover runbook: [`docs/pages-cutover.md`](docs/pages-cutover.md).
- **5.0.8 Java:** [`.github/workflows/build.yml`](.github/workflows/build.yml) — branch **`legacy/java-5.0.8`** only (+ `workflow_dispatch` checks out that branch); not path-filtered on `master`.

## Phase 1 notes

`@qa-guru/allure-notifications-config` (`packages/config/`):

- zod `ConfigSchema` — `base.chart` free layout + chrome knobs (`headerHeight` / `cardGap` / `tilePad`)
- `PANEL_CATALOG` (19 — incl. `allureQualityGate` / `sonarQualityGate` with `type: qualityGate`), `DEFAULT_ITEMS` (SQ-1080 4-tile compact-hero), `CANVAS_PRESETS` (870/1080/1410×1080), `createDefaultConfig()`
- `base.chart.profile`: `"default"` | `"kit"` (default `"default"`; manual — not tied to HTML `withKit`)
- Quality-gate items parse under any profile; collage silent-skips kit-only kinds when `profile !== "kit"` (`shouldSilentSkipKitOnlyItem`)
- Extracted from hub builder `allure-notifications-builder/js/app.js` (builder still has a local copy until Phase 4 / `apps/builder/` merge)
- Verify: `pnpm --filter @qa-guru/allure-notifications-config test`

## Phase 2 notes (removed — now in kit)

Collage palette + testing-pyramid geometry live in `@qa-guru/allure-report-kit` (`/collage` export):

- Palette mirrors monorepo SSOT `stacks/java-spring/tests/allure/pyramid-layers.json`
- `unit` light/dark = collage `STATUS_COLORS.passed` / `#94ca66`
- Geometry: `CORNER_RATIO=0.18`, `TIER_GAP_RATIO=0.11` (+ `tierGapPx` / `tierCornerRadius`)
- Verify: kit `test/collage-palette.test.mjs` and (from monorepo root) `python scripts/pyramid_palette_sync.py --check`
- `@qa-guru/allure-notifications-pyramid` — **removed** (deprecated on npm)

## Phase 3 notes (core — Stage C)

`@qa-guru/allure-notifications-core` (`packages/core/`):

- Native collage PNG via **`@napi-rs/canvas`** (locked in package README) — not Playwright
- Depends on `@qa-guru/allure-notifications-config` + `@qa-guru/allure-report-kit`
- Allure 3 `summary.json` (`stats`) + `*-result.json` → `ReportAnalytics` → free-layout collage
- Panels: **real** = pie / testingPyramid / durations (+ `groupBy: layer`); **empty-state stubs** =
  other `PANEL_CATALOG` types + unknown tiles (Java `EmptyStatePanel` parity — themed card,
  catalog title via `resolvePanelMeta`, muted `No data yet`; no silent-drop). Deferred full
  analytics: statusDynamics / successRateDistribution / testResultSeverities / suites
- Tests: fixture → PNG; unit green `#94ca66`; pixel/ahash vs
  monorepo `docs/allure-notifications/canon/collage-cb870-free-dogfood-5.0.3.png`
- Verify: `pnpm --filter @qa-guru/allure-notifications-core test` / root `pnpm test`
- **Not in Stage C:** `packages/cli`, messengers / Telegram dogfood, `apps/builder`

## Phase 3 notes (cli — Stage D)

`@qa-guru/allure-notifications` (`packages/cli/`):

- Bin: `allure-notifications` → `send --config <path>`
- Collage via `@qa-guru/allure-notifications-core` + `@qa-guru/allure-notifications-config`
- Messengers: **`--dry-run` / `--mock`** (default safe, no network); **`--live`** → Telegram `sendPhoto` (ADR 008)
- Credentials: env `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_TOPIC_ID` (override config; refuse retired chat)
- Optional `--out <png>` writes buffer to disk
- Tests: argv parse + dry-run/mock + mocked live fetch; real network only if `ALLURE_NOTIFICATIONS_LIVE_TEST=1`
- Dogfood runbook: [`docs/telegram-dogfood.md`](docs/telegram-dogfood.md) · fixture `packages/cli/test/fixtures/config.dogfood-cb870.json`
- Verify: `pnpm --filter @qa-guru/allure-notifications test` / root `pnpm test`

## Stage E notes (builder merge)

`@qa-guru/allure-notifications-builder` (`apps/builder/`):

- Merged from hub clone `allure-notifications-builder/` (Playwright + index/js/css/vendor)
- Stand registry cwd → `…/allure-notifications/apps/builder` (`ensure.py anb-apps-builder`)
- Playwright e2e: CB-870 / SQ-1080 / WD-1410, export, panel bar (`tests/smoke.spec.js`)
- Started `@qa-guru/allure-notifications-config` import via `tests/config-parity.test.mjs` (browser `js/app.js` still local — Phase 4)
- Verify: `pnpm --filter @qa-guru/allure-notifications-builder test` / root `pnpm test`
- **Not in Stage E:** live Telegram, publish, Java→`legacy/java`, VERSION bump, Stage F CI

## Stage F notes (CI)

- Workflow: `.github/workflows/ci-6.0.yml` — Node 24 + pnpm 9.15 + Python 3.12; `pnpm install --frozen-lockfile`; Playwright Chromium; `pnpm test` (config/pyramid/core/cli + builder unit/e2e).
- Triggers: push `master` + `feature/6.0*`; PRs into `feature/6.0*` or `master` with path filter on `packages/**` / `apps/**` / pnpm lockfiles / this workflow.
- Java `build.yml` — archive branch `legacy/java-5.0.8` only; no shared job / no VERSION bump / no live Telegram in 6.0 CI.
- Cookbook: `docs/ci-cookbook.md` documents real `send --config --dry-run` (+ workspace `pnpm exec` pre-publish).
- **Telegram dogfood (ADR 008):** CLI `--live` + [`docs/telegram-dogfood.md`](docs/telegram-dogfood.md); **not** wired into `ci-6.0.yml`.

## Phase 4 notes (builder → shared packages)

- `@qa-guru/allure-notifications-config/browser` — catalog + presets + `createDefaultConfig` (no zod)
- `apps/builder/scripts/sync-config.mjs` → `vendor/allure-notifications-config/` (real files; stand cannot follow pnpm symlink outside cwd)
- `index.html` import map: `@qa-guru/allure-notifications-config` → vendor `browser.js`
- `js/app.js` imports SSOT; local leftovers = packing / TG preview / vector UI only
- `@qa-guru/allure-report-kit/collage` — geometry (`CORNER_RATIO` / `TIER_GAP_RATIO`) + layer palette (`unit` = `#94ca66`)
- `apps/builder/scripts/sync-kit-collage.mjs` → `vendor/allure-report-kit-collage/`
- `index.html` import map: `@qa-guru/allure-report-kit/collage` → vendor `collage.js`
- `js/app.js` injects `--layer-*` + `--anb-pyramid-*` from kit collage; packing UI stays local
- Parity: `tests/config-parity.test.mjs` · `tests/collage-parity.test.mjs`
- Verify: `pnpm --filter @qa-guru/allure-notifications-builder test` / root `pnpm test`

## Layout move notes (Java → `legacy/java` → archive branch)

- Moved: `allure-notifications/`, `allure-notifications-api/`, root Gradle files, `gradle/`, `gradlew*`, plus `config/checkstyle` (Gradle rootDir).
- Later cut from `master`: tree kept forever on branch [`legacy/java-5.0.8`](https://github.com/qa-guru/allure-notifications/tree/legacy/java-5.0.8/legacy/java); jar → [release v5.0.8](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.8).
- Dogfood JSON/PNG under repo-root `config/` stay put; on the archive branch `config/ci-telegram.json` Allure paths → `legacy/java/…`.
- Build (archive): `git checkout legacy/java-5.0.8 && cd legacy/java && ./gradlew assemble`.
- **Not in this move:** Telegram live dogfood, publish, Pages/archive, VERSION bump, Matrix.

## Pages prep notes (post-G)

- Workflow deploys assembled `_site` from `apps/builder/` (+ `sync-config` / `sync-kit-collage` for vendor `@config` + kit collage).
- Artifact includes `CNAME` = current prod hostname `allure-notifications.qa.guru` (checklist also mentions `allure.notifications.qa.guru` — confirm before DNS edits).
- **Manual (GitHub UI):** enable Pages source = GitHub Actions; smoke on `qa-guru.github.io/allure-notifications/`; then move custom domain off `allure-notifications-builder` onto this repo ([`docs/pages-cutover.md`](docs/pages-cutover.md)).
- Archive second repo = **after** domain cutover + separate HQ OK (checklist row 4).

## Phase 5 notes (Allure 3 plugin)

`@qa-guru/allure-notifications-plugin` (`packages/plugin/`):

- Implements `@allurereport/plugin-api` `Plugin.done` (etalon: `@allurereport/plugin-slack`)
- Pipeline: `parseConfig` → `loadReportAnalytics` / `renderCollagePng` (`@qa-guru/allure-notifications-core`, `@napi-rs/canvas`) → `deliver` (CLI messengers)
- Options: `config` (path or inline), `mode: "dry-run" | "mock" | "live"` (**default dry-run**, no network), optional `out` / `reportFile`
- Example: [`examples/allurerc.notifications.mjs`](examples/allurerc.notifications.mjs)
- Tests: fixture dry-run → PNG + dry-run messenger (no network)
- Verify: `pnpm --filter @qa-guru/allure-notifications-plugin test` / root `pnpm test` + `pnpm typecheck`
- **Not in Phase 5:** npm publish / VERSION bump (propose **6.0.5**), AI features

## Next

Phase 5 **done** + docs prep for plugin consumers. **Next = release 6.0.5** (npm publish plugin + pin bump), then AI features (by OK). Do not bump `VERSION` / publish without HQ.

## 6.1.0 — quality gates + testsTable (kit profile)

**Pin:** `@qa-guru/allure-notifications@6.1.0` (+ scoped `@qa-guru/allure-notifications-*` at the same version).

### Breaking: `chart.sonarProjectStatusPath` removed

Rename to **`chart.sonarQualityGatePath`** (Sonar `projectStatus` JSON path for the `sonarQualityGate` collage tile).

```json
{
  "base": {
    "chart": {
      "profile": "kit",
      "sonarQualityGatePath": "fixtures/sonar/project-status.json",
      "allureQualityGatePath": "widgets/kit-panels/allureQualityGate.json"
    }
  }
}
```

Configs using the old field name will fail schema validation — search/replace `sonarProjectStatusPath` → `sonarQualityGatePath`.

### New (kit profile)

- `chart.profile`: `"default"` | `"kit"` — kit-only tiles (`allureQualityGate`, `sonarQualityGate`, `testsTable`) **silent-skip** when `profile !== "kit"`.
- Quality-gate collage tiles render via `@qa-guru/allure-report-kit` layout IR when `profile=kit` (pin kit **≥ 0.3.0**).
- `testsTable` panel kind — kit tests-table PNG in collage (builder palette T5/T7).

### Consumer checklist

1. Bump CLI + scoped packages to **6.1.0** (single train).
2. Replace `sonarProjectStatusPath` if present.
3. For QG/testsTable collage: set `"profile": "kit"` and provide data paths / widget JSON.
4. Dry-run: `npx @qa-guru/allure-notifications@6.1.0 send --config config.json --dry-run`