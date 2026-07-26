# CI cookbook (6.0 TypeScript)

Public surface after Phase 3 / Stages C–D: CLI `send --config` renders a native collage PNG (`@napi-rs/canvas`) and dry-runs or mocks messengers. Java `java -jar` remains the **5.0** path under [`legacy/java/`](../legacy/java/).

## Contract

1. Generate Allure 3 report (or point `base.allureFolder` / `base.allureResultsFolder` at existing artifacts).
2. Run **allure-notifications** as a separate post-step with `config.json`.
3. CLI reads report summary/results → collage PNG → messenger(s).
4. CLI does **not** patch awesome/dashboard HTML.

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

Default without `--mock` / `--live` is safe **dry-run**. Live Telegram = explicit `--live` + env credentials ([`telegram-dogfood.md`](telegram-dogfood.md)); **not** in `ci-6.0.yml`.

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

TS tests live in [`.github/workflows/ci-6.0.yml`](../.github/workflows/ci-6.0.yml) (`pnpm i` + `pnpm typecheck` + `pnpm test` + soft `pnpm coverage` + `pnpm allure:generate` on `master` + `feature/6.0*` + `feature/quality-*`). Artifacts: `allure-results/` · `allure-report/` · `coverage/` (retain ≥7d). Job **Sonar (soft)** needs coverage → `scripts/ci-sonar.sh` + vendored `scripts/sonar-gate-wait.py` (`projectKey=allure-notifications`; `SONAR_REQUIRED=false`). Builder Pages: [`pages-builder.yml`](../.github/workflows/pages-builder.yml) (static `apps/builder/` on `master` + `feature/6.0*`; see [`pages-cutover.md`](pages-cutover.md)). Java jar CI stays in [`build.yml`](../.github/workflows/build.yml) (**master** only; cwd `legacy/java`).

## Own tests → Allure results (Q1)

This repo’s **own** test run writes Allure results for the quality contour. Separate from product dogfood fixtures under `packages/core/test/fixtures/dogfood-*` (those feed CLI collage, not CI report of unit/e2e).

| Slice | Adapter | Output |
|-------|---------|--------|
| Packages `node:test` | **`allure-node-test`** reporter (`allure-js` ecosystem + `allure-js-commons`) | `allure-results/` at repo root |
| Builder unit `node:test` | same reporter | same dir |
| Builder Playwright e2e | **`allure-playwright`** in `apps/builder/playwright.config.js` | same dir |

```bash
pnpm test                 # sets ALLURE_RESULTS_DIR=<repo>/allure-results, runs workspace tests
pnpm coverage             # c8 → coverage/lcov.info (soft; no % gate; packages only)
pnpm allure:generate      # allure generate allure-results --output allure-report
```

Notes:

- Node before 26.1: reporter-only mode (pass/fail/skip) — no `allure-js-commons` runtime API preload required. CI uses Node 20.
- `ALLURE_RESULTS_DIR` must point at the **repo root** `allure-results/` (root `scripts/run-tests.mjs`); do not write into package cwd.
- Coverage excludes: `dist` test emit noise, `node_modules`, `vendor`, `test/fixtures`, `apps/builder/js`, `**/*.test.*`. Soft collect only until Q5.
- Forks/PR: no live secrets needed for this path (tests + Allure generate + coverage artifact).

## Sonar (Q2, soft)

One Sonar project for the TS monorepo: **`allure-notifications`** → [dashboard](https://sonar.qa.guru/dashboard?id=allure-notifications).  
Config: [`sonar-project.properties`](../sonar-project.properties). Coverage in: `coverage/lcov.info` (from `pnpm coverage`).  
Gate poll: vendored thin copy [`scripts/sonar-gate-wait.py`](../scripts/sonar-gate-wait.py) (nested CI has no monorepo `scripts/`; keep in sync with zds `scripts/sonar-gate-wait.py`). Wrapper: [`scripts/ci-sonar.sh`](../scripts/ci-sonar.sh).

| Var / secret | Kind | Default / note |
|--------------|------|----------------|
| `SONAR_TOKEN` | secret | never on fork PRs |
| `SONAR_HOST_URL` | var | `https://sonar.qa.guru` |
| `SONAR_REQUIRED` | var | `false` until Q5 — soft-skip on missing token / host down / gate ≠ PASSED |

Local dry-run (no token, no upload):

```bash
python scripts/sonar-gate-wait.py --project-key allure-notifications --dry-run
# optional: after pnpm coverage, full soft path (skips without SONAR_TOKEN)
SONAR_REQUIRED=false bash scripts/ci-sonar.sh
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
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
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

      - uses: actions/upload-artifact@v4
        with:
          name: collage
          path: collage.png
```

Replace `npx allure-notifications` with `pnpm exec allure-notifications` when consuming the workspace before publish. Point `base.allureFolder` / `base.allureResultsFolder` in `config/notifications.json` at the generated paths.

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
| Allure 3 plugin install for notify | CLI is the entrypoint; optional thin plugin = Phase 5 |
| HTML inject / `dashboard-overrides` in CI | Private zds stack only — not npm product |
| Playwright for production PNG | Playwright = builder e2e only; collage = `@napi-rs/canvas` |

## Config

Use builder export (`apps/builder/`) → `config.json` with free layout (`chart.layout: "free"`, `items`). Default canvas target: **CB-870** (870×1080). Example dry-run fixture: `packages/cli/test/fixtures/config.dry-run.json` (classic CB-870 pie + pyramid + durations).
