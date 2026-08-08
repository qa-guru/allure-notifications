# GitHub Actions examples

These workflows are runnable dogfood examples. They use the checked-in
`packages/core/test/fixtures/dogfood-results` data and default to `dry-run`, so
no Telegram network call is required.

## Variants

1. **Marketplace Action — recommended**
   - Workflow: [`example-marketplace.yml`](workflows/example-marketplace.yml)
   - Runtime: `qa-guru/allure-notifications@v6`
   - Pipeline: install Allure → one report generate → Action send.

2. **Native npm CLI**
   - Workflow: [`example-native-cli.yml`](workflows/example-native-cli.yml)
   - Runtime: `@qa-guru/allure-notifications@6.0.14`
   - Pipeline: install published packages → one report generate → CLI `send`.

3. **Allure plugin — alternate capability**
   - Workflow: [`example-allure-plugin.yml`](workflows/example-allure-plugin.yml)
   - Runtime: `@qa-guru/allure-notifications-plugin@6.0.14`
   - The plugin executes in `Plugin.done`. The dogfood example supplies a
     checked-in report fixture because files from the current generate are
     flushed after `done`.

4. **Local Action source — repository E2E**
   - Workflow: [`action-e2e.yml`](workflows/action-e2e.yml)
   - Runtime: root `action.yml` through `uses: ./`.
   - Runs on pushes and pull requests as the release gate.

5. **Legacy Java JAR**
   - Workflow: [`build.yml`](workflows/build.yml)
   - Kept for the frozen Java 5.0.8 capability; it is not the recommended 6.x
     consumer path.

All runnable examples validate the collage with the local
[`assert-collage`](actions/assert-collage/action.yml) composite Action and
upload the PNG/report as workflow artifacts.

## Run manually

```bash
gh workflow run example-marketplace.yml -f mode=dry-run
gh workflow run example-native-cli.yml -f mode=dry-run
gh workflow run example-allure-plugin.yml -f mode=dry-run
```

Use `mode=live` only when `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and
`TELEGRAM_TOPIC_ID` are configured. Credentials remain environment values and
are never rendered into JSON.

Shared report configs live in
[`examples/allure-notifications/`](examples/allure-notifications/). The static
notification config reused by the examples is
[`examples/github-actions/notifications/config.json`](../examples/github-actions/notifications/config.json).
