# CI cookbook (6.0 TypeScript)

Public surface after Phase 3 / Stages C–D: CLI `send --config` renders a native collage PNG (`@napi-rs/canvas`) and dry-runs or mocks messengers. Java `java -jar` remains the **5.0** path under [`legacy/java/`](../legacy/java/).

## Contract

1. Generate Allure 3 report (or point `base.allureFolder` / `base.allureResultsFolder` at existing artifacts).
2. **Primary:** run **allure-notifications CLI** as a separate post-step with `config.json`.
3. CLI reads report summary/results → collage PNG → messenger(s).
4. CLI does **not** patch awesome/dashboard HTML.
5. **Alternate (after generate):** Allure 3 plugin via `allurerc` — [`examples/allurerc.notifications.mjs`](../examples/allurerc.notifications.mjs) · [`packages/plugin/README.md`](../packages/plugin/README.md). Same config schema / modes; not required for consumers.

```bash
npx allure generate allure-results --clean -o allure-report
npx allure-notifications send --config config.json --dry-run
```

| Flag | Behavior |
|------|----------|
| `send --config <path>` | Required — load config, collage via `@allure-notifications/core` |
| `--dry-run` | Render PNG; list messengers that *would* send; **no network** |
| `--mock` | Render PNG; mock deliveries; **no network** |
| `--out <png>` | Write PNG buffer to disk |

Default without `--mock` / `--live` is safe **dry-run**. Live Telegram = explicit `--live` + env credentials ([`telegram-dogfood.md`](telegram-dogfood.md)). Product CI job **`telegram`** in `ci-6.0.yml` (Q4): PR `--dry-run`; `master` / `workflow_dispatch` `--live` when secrets present. CLI pin SSOT: monorepo `docs/allure-notifications/VERSION` (**6.0.9**).

### Alternate — Allure 3 plugin (`allurerc`)

Use when notifications should run **inside** `allure generate` (plugin `done` hook), not as a separate shell step:

```bash
npx allure generate ./allure-results --config ./examples/allurerc.notifications.mjs
```

| | CLI (primary) | Plugin (alternate) |
|--|---------------|--------------------|
| Invoke | `npx allure-notifications send --config …` | `plugins.notifications` in `allurerc` |
| Safe default | `--dry-run` | `mode: "dry-run"` |
| Live | `--live` + `TELEGRAM_*` | `mode: "live"` + same env |
| Config | `config.json` | `options.config` → same schema |

npm `@allure-notifications/plugin` — needs **`main`** for Allure `require.resolve` (**≥6.0.9**; skip 6.0.6; workspace dogfood OK). **Separate GitHub Actions example (plugin, not CLI):** [`examples/github-actions/`](../examples/github-actions/) · runnable workflow [`.github/workflows/example-plugin-notify.yml`](../.github/workflows/example-plugin-notify.yml) (`workflow_dispatch`, default dry-run).

## Workspace (local / before `npx`)

```bash
pnpm install
pnpm --filter allure-notifications run build
pnpm exec allure-notifications send \
  --config packages/cli/test/fixtures/config.dry-run.json \
  --dry-run \
  --out /tmp/collage-dry-run.png
```

Fixture config already points at `packages/core/test/fixtures/dogfood-report` + `dogfood-results`.

## GitHub Actions — product CI (this repo)

TS tests live in [`.github/workflows/ci-6.0.yml`](../.github/workflows/ci-6.0.yml) (`pnpm i` + `pnpm typecheck` + `pnpm test` + hard `pnpm coverage` = packages c8 + builder istanbul at **100% × 4** + `pnpm allure:generate` on `master` + `feature/6.0*` + `feature/quality-*`). Artifacts: `allure-results/` · `allure-report/` · `coverage/` (retain ≥7d). Job **Sonar (hard / Q5)** needs coverage → `scripts/ci-sonar.sh` + vendored `scripts/sonar-gate-wait.py` (`projectKey=allure-notifications`; `SONAR_REQUIRED=true`; forks / no token soft-skip). Job **TestOps (informational)** needs `allure-results` → `setup-allurectl@v1` + `allurectl upload` + close (soft-skip without `ALLURE_*`; forks never upload). Job **Telegram (Q4)** needs `allure-report` → `scripts/ci-telegram.sh` + `config/ci-telegram.json` (`npx allure-notifications@6.0.9`; PR dry-run / master live → topic 34). Builder Pages: [`pages-builder.yml`](../.github/workflows/pages-builder.yml) (static `apps/builder/` on `master` + `feature/6.0*`; see [`pages-cutover.md`](pages-cutover.md)). Java jar CI stays in [`build.yml`](../.github/workflows/build.yml) (**master** only; cwd `legacy/java`).

## Own tests → Allure results (Q1)

This repo’s **own** test run writes Allure results for the quality contour. Separate from product dogfood fixtures under `packages/core/test/fixtures/dogfood-*` (those feed CLI collage, not CI report of unit/e2e).

| Slice | Adapter | Output |
|-------|---------|--------|
| Packages `node:test` | **`allure-node-test`** reporter (`allure-js` ecosystem + `allure-js-commons`) | `allure-results/` at repo root |
| Builder unit `node:test` | same reporter | same dir |
| Builder Playwright e2e | **`allure-playwright`** in `apps/builder/playwright.config.js` | same dir |

```bash
pnpm test                 # sets ALLURE_RESULTS_DIR=<repo>/allure-results, runs workspace tests
pnpm coverage             # packages c8 + builder istanbul; fails unless all four metrics = 100%
pnpm allure:generate      # allure generate allure-results --output allure-report
```

Notes:

- Node **24** (CI pin) with **reporter-only** `allure-node-test` — suite labels via `declareSuite` registry + `scripts/merge-allure-suite-meta.mjs`. See [`test-metadata.md`](test-metadata.md).
- `ALLURE_RESULTS_DIR` must point at the **repo root** `allure-results/` (root `scripts/run-tests.mjs`); do not write into package cwd.
- After tests: `node scripts/merge-allure-suite-meta.mjs` then `node scripts/check-allure-labels.mjs` (hooked in `run-tests.mjs`) — every result must carry `epic`, `feature`, `story`, `layer`, `severity` (+ `component` for `e2e`/`component` layers).
- Coverage gate (`scripts/run-coverage.mjs`):
  1. **Packages** — c8 on `packages/*/src` ([`c8.config.json`](../c8.config.json)): lines / statements / branches / functions = **100%**. Excludes `dist` test emit, `node_modules`, `vendor`, `test/fixtures`, `**/*.test.*`, and raw `apps/builder/js/**` (builder uses its own instrumented path).
  2. **Builder** — [`scripts/builder-coverage.mjs`](../scripts/builder-coverage.mjs): istanbul on `apps/builder/js/{app,phrases}.js` (SSOT `src/app.ts` + `src/phrases.ts`) via Playwright + `ANB_COVERAGE=1`; same four metrics = **100%**. Excludes sync-scripts, playwright.config, vendor, tests.
- Collage/visual pixel gate stays in `pnpm test` — not mixed with % floor.
- Forks/PR: no live secrets needed for this path (tests + Allure generate + coverage artifact).

## Sonar (Q2 soft → Q5 hard)

One Sonar project for the TS monorepo: **`allure-notifications`** → [dashboard](https://sonar.qa.guru/dashboard?id=allure-notifications).  
Config: [`sonar-project.properties`](../sonar-project.properties). Coverage in: `coverage/lcov.info` (from `pnpm coverage`).  
Gate poll: vendored thin copy [`scripts/sonar-gate-wait.py`](../scripts/sonar-gate-wait.py) (nested CI has no monorepo `scripts/`; keep in sync with zds `scripts/sonar-gate-wait.py`). Wrapper: [`scripts/ci-sonar.sh`](../scripts/ci-sonar.sh).

| Var / secret | Kind | Default / note |
|--------------|------|----------------|
| `SONAR_TOKEN` | secret | never on fork PRs |
| `SONAR_HOST_URL` | var | `https://sonar.qa.guru` |
| `SONAR_REQUIRED` | var | **`true`** (Q5) — gate ≠ PASSED fails job when token present; forks / no token always soft-skip |

Local dry-run (no token, no upload):

```bash
python scripts/sonar-gate-wait.py --project-key allure-notifications --dry-run
# after pnpm coverage: skips without SONAR_TOKEN even if SONAR_REQUIRED=true
bash scripts/ci-sonar.sh
```

## Harden (Q5)

Quality contour close-out for this repo:

| Gate | Policy |
|------|--------|
| Coverage | **blocker** — packages c8 + builder istanbul: lines / statements / branches / functions = **100%** (`pnpm coverage`) |
| Sonar | **blocker** when `SONAR_TOKEN` present + `SONAR_REQUIRED=true` and quality gate ≠ PASSED |
| Forks / no token | Sonar **soft-skip** (exit 0); coverage still runs (no secrets needed) |
| Visual / collage | Unchanged pixel/ahash gate in `pnpm test` — **not** part of coverage % floor |
| TestOps / Telegram | Still informational / dry-run-on-PR as Q3–Q4 |

Contour complete. Phase 5 plugin **done** (GH example #492/#493…; plugin pin **`@6.0.9`**, CLI **`@6.0.9`**). Next product: **AI** only (separate HQ OK).

## TestOps (Q3, informational)

Upload this repo’s own `allure-results/` to Allure TestOps after the test job. Ethalon shape: `allure-framework/setup-allurectl@v1` → `allurectl upload allure-results` → close launch. **Not** a merge blocker (`continue-on-error` + soft-skip).

| Var / secret | Kind | Default / note |
|--------------|------|----------------|
| `ALLURE_TOKEN` | secret | never on fork PRs; never commit |
| `ALLURE_ENDPOINT` | var | `https://allure.qa.guru` |
| `ALLURE_PROJECT_ID` | var | TestOps project id (GH var only — not in git) |

Launch name: `allure-notifications · <ref_name> · <sha>`. Job summary prints the launch URL when upload succeeds. Missing secrets / empty results / forks → soft-skip (job still green).

## Telegram (Q4)

Collage of **this run’s** Allure report into ADR 008 Monitoring topic **34** (`allure-notifications`). Wrapper: [`scripts/ci-telegram.sh`](../scripts/ci-telegram.sh). Template config: [`config/ci-telegram.json`](../config/ci-telegram.json) (CB-870 layout aligned with `DEFAULT_ITEMS`: pie · suites · testing pyramid **↔** durations-by-layer on row 2; no history/severity panels). Before send, [`scripts/enrich-allure-layers.mjs`](../scripts/enrich-allure-layers.mjs) tags `allure-results` with `layer` labels (unit / component / e2e) so the pyramid renders instead of an empty fallback. Points at `../allure-report` + `../allure-results`; runtime file gitignored. Missing `allure-report/summary.json` → **fail** (no dogfood fixture fallback).

| Event | Mode |
|-------|------|
| Same-repo PR / feature push | `--dry-run` (no network; **fail = fix wiring**) |
| `master` push / `workflow_dispatch` | `--live` when `TELEGRAM_*` present; else soft-skip |
| Fork PR | never `--live` (dry-run only) |

| Var / secret | Kind | Default / note |
|--------------|------|----------------|
| `TELEGRAM_BOT_TOKEN` or `TELEGRAM_TOKEN` | secret | never on fork PRs; never commit |
| `TELEGRAM_CHAT_ID` | secret | `-1004381150566` |
| `TELEGRAM_TOPIC_ID` | var | **34** (alias `TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID`) |

CLI pin: `npx allure-notifications@6.0.9`. Optional artifact: `collage-telegram.png`. Job summary prints `message_id` on live success. Missing secrets on live path → soft-skip (not a merge blocker).

Local rehearsal:

```bash
# with this-run report already generated:
MODE=dry-run bash scripts/ci-telegram.sh
```

## GitHub Actions — consumer notify (dry-run)

```yaml
# Example post-step after your test job uploads/generates Allure artifacts
name: allure-notifications (dry-run)
on:
  workflow_run:
    workflows: [tests]
    types: [completed]

jobs:
  notify:
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: pnpm/action-setup@v6
        with:
          version: 9.15.0

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm

      # … restore allure-results / checkout this repo as a path dependency, or use npx after publish …
      - name: Generate Allure report
        run: npx allure generate allure-results --clean -o allure-report

      - name: Collage dry-run (no Telegram network)
        run: |
          npx allure-notifications send \
            --config config/notifications.json \
            --dry-run \
            --out collage.png

      - uses: actions/upload-artifact@v7
        with:
          name: collage
          path: collage.png
```

Replace `npx allure-notifications` with `pnpm exec allure-notifications` when consuming the workspace before publish. Point `base.allureFolder` / `base.allureResultsFolder` in `config/notifications.json` at the generated paths.

## GitHub Actions — consumer notify via plugin (alternate)

Same job shape as the CLI consumer example, but notifications run in `allurerc` (`done` hook). **Two generate steps** (Allure flushes `summary.json` after `Plugin.done` — see [`examples/github-actions/README.md`](../examples/github-actions/README.md)). Full template: [`examples/github-actions/plugin-notify.yml`](../examples/github-actions/plugin-notify.yml). Product dogfood: Actions → **Example — plugin notify**.

```yaml
- name: Install Allure 3 + plugin
  run: npm install allure@^3.14.3 @allure-notifications/plugin@6.0.9

- name: Generate report (files on disk)
  run: npx allure generate ./allure-results -o ./allure-report

- name: Generate again + plugin notify
  env:
    NOTIFICATION_MODE: dry-run   # or live + TELEGRAM_*
  run: |
    npx allure generate ./allure-results \
      --config ./examples/github-actions/allurerc.mjs
```

## Jenkins (dry-run)

Freestyle / Pipeline — shell after tests:

```groovy
stage('Allure report') {
  steps {
    sh 'npx allure generate allure-results --clean -o allure-report'
  }
}
stage('Notifications dry-run') {
  steps {
    sh '''
      npx allure-notifications send \
        --config config/notifications.json \
        --dry-run \
        --out collage.png
    '''
  }
}
```

Live messenger send (token in credentials) is out of band until ADR 008 dogfood is OK’d; keep CI default on `--dry-run`.

## Explicit non-goals (this cookbook)

| Avoid | Why |
|-------|-----|
| `java -jar allure-notifications-*.jar` on 6.0 path | Legacy 5.0 only |
| Jenkins Plugin Manager install | Not a Jenkins plugin |
| Allure 3 plugin as sole CI path | CLI remains primary; plugin = optional `allurerc` after `allure generate` (see § Alternate) |
| HTML inject / `dashboard-overrides` in CI | Private zds stack only — not npm product |
| Playwright for production PNG | Playwright = builder e2e only; collage = `@napi-rs/canvas` |

## Config

Use builder export (`apps/builder/`) → `config.json` with free layout (`chart.layout: "free"`, `items`). Default canvas target: **CB-870** (870×1080). Example dry-run fixture: `packages/cli/test/fixtures/config.dry-run.json` (classic CB-870 pie + pyramid + durations).
