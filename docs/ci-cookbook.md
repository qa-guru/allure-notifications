# CI cookbook (6.0 TypeScript)

Public surface after Phase 3 / Stages C–D: CLI `send --config` renders a native collage PNG (`@napi-rs/canvas`) and dry-runs or mocks messengers. Java `java -jar` remains the **5.0** path (repo-root modules today; later `legacy/java/`).

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

Default without `--mock` is safe **dry-run** (Stage D). Live Telegram = ADR 008 / explicit HQ OK (not in this cookbook’s default CI path).

## Workspace (pre-publish)

Until npm publish, use the monorepo on `feature/6.0-phase-0-1`:

```bash
pnpm install
pnpm --filter @allure-notifications/cli run build
pnpm exec allure-notifications send \
  --config packages/cli/test/fixtures/config.dry-run.json \
  --dry-run \
  --out /tmp/collage-dry-run.png
```

Fixture config already points at `packages/core/test/fixtures/dogfood-report` + `dogfood-results`.

## GitHub Actions — product CI (this repo)

TS tests live in [`.github/workflows/ci-6.0.yml`](../.github/workflows/ci-6.0.yml) (`pnpm i` + `pnpm test` on `feature/6.0*`). Java jar CI stays in [`build.yml`](../.github/workflows/build.yml) (**master** only).

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

Use builder export (`apps/builder/`) → `config.json` with free layout (`chart.layout: "free"`, `items`). Default canvas target: **SQ-1080**. Example dry-run fixture: `packages/cli/test/fixtures/config.dry-run.json` (CB-870 pie + pyramid + durations).
