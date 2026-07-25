# CI cookbook sketch (6.0 TypeScript)

Target public surface after Phase 3. **Not** runnable end-to-end until `packages/cli` ships. Java `java -jar` remains the 5.0 path under `legacy/java/`.

## Contract

1. Generate Allure 3 report (or ensure `allure-report/` exists).
2. Run **allure-notifications** as a separate post-step with `config.json`.
3. CLI reads report artifacts / summary → native collage PNG → messenger(s).
4. CLI does **not** patch awesome/dashboard HTML.

```bash
npx allure generate
npx allure-notifications send --config config.json
```

## GitHub Actions (sketch)

```yaml
# .github/workflows/notify.yml — sketch only
name: allure-notifications
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
      # … restore allure-results / generate report …
      - name: Generate Allure report
        run: npx allure generate allure-results --clean -o allure-report
      - name: Send notifications
        env:
          TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT: ${{ secrets.TELEGRAM_CHAT }}
        run: npx allure-notifications send --config config/notifications.json
```

## Jenkins (sketch)

Freestyle / Pipeline — two shell steps after tests (same as GH):

```groovy
// Pipeline fragment — sketch only
stage('Allure report') {
  steps {
    sh 'npx allure generate allure-results --clean -o allure-report'
  }
}
stage('Notifications') {
  steps {
    withCredentials([string(credentialsId: 'telegram-token', variable: 'TELEGRAM_TOKEN')]) {
      sh 'npx allure-notifications send --config config/notifications.json'
    }
  }
}
```

## Explicit non-goals (this cookbook)

| Avoid | Why |
|-------|-----|
| `java -jar allure-notifications-*.jar` on 6.0 path | Legacy 5.0 only (`legacy/java/`) |
| Jenkins Plugin Manager install | Not a Jenkins plugin |
| Allure 3 plugin install for notify | CLI is the entrypoint; optional thin plugin = Phase 5 |
| HTML inject / `dashboard-overrides` in CI | Private zds stack only — not npm product |

## Config

Use builder export (`apps/builder/` after merge) → `config.json` with free layout (`chart.layout: "free"`, `items`). Default canvas target: **SQ-1080**.
