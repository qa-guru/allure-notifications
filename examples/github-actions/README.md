# GitHub Marketplace Action

Runnable dogfood workflows for every integration variant are documented in
[`.github/README.md`](../../.github/README.md).

The primary pipeline is:

```text
tests → allure-results → npx allure generate (once) → Action send
```

The Action reads an existing report. It does not run Allure and does not write
runtime JSON. Keep a static [`notifications/config.json`](notifications/config.json)
in the consumer repository and pass credentials only through environment
variables.

```yaml
- uses: qa-guru/allure-notifications@v6
  with:
    config: notifications/config.json
    allure-folder: build/reports/allure-report/allureReport/awesome
    allure-results-folder: build/allure-results
    mode: live
  env:
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHAT_ID: ${{ vars.TELEGRAM_CHAT_ID }}
    TELEGRAM_TOPIC_ID: ${{ vars.TELEGRAM_TOPIC_ID }}
```

Runtime folder inputs are resolved from the consumer workspace, or from
`working-directory` when it is set. Relative paths stored inside the static
config remain relative to the config file.

[`cli-notify.yml`](cli-notify.yml) is the copy-paste workflow and
[`allurerc.mjs`](allurerc.mjs) is its native Allure 3 config.

## Plugin capability

`@allure-notifications/plugin` remains available as a legacy alternate. It is
not the recommended GitHub Actions path because Allure calls `Plugin.done`
before report files are flushed, which requires another generate pass. Its
separate example is [`plugin-notify.yml`](plugin-notify.yml) with
[`allurerc.plugin.mjs`](allurerc.plugin.mjs).
