# CI cookbook — allure-notifications 5.0

Examples for sending notifications with **collage chart** and **multi-link** templates from CI.

Full config reference: [migration-5.0.md](migration-5.0.md).

## Example `config.json`

See [config/config-5.0-collage.example.json](../config/config-5.0-collage.example.json).

```json
{
  "base": {
    "project": "${JOB_BASE_NAME}",
    "environment": "${STAND}",
    "comment": "Automated test run",
    "language": "en",
    "allureFolder": "build/allure-report/",
    "allureResultsFolder": "build/allure-results/",
    "enableChart": true,
    "darkMode": true,
    "enableSuitesPublishing": false,
    "chart": {
      "mode": "collage",
      "pyramidFallback": "suites",
      "width": 1000,
      "height": 600
    },
    "links": {
      "report": "${ALLURE_REPORT_URL}",
      "dashboard": "${ALLURE_DASHBOARD_URL}",
      "testops": "${ALLURE_JOB_RUN_URL}",
      "build": "${BUILD_URL}"
    }
  },
  "telegram": {
    "token": "${TELEGRAM_BOT_TOKEN}",
    "chat": "${TELEGRAM_CHAT_ID}",
    "templatePath": "/templates/telegram.ftl"
  }
}
```

Placeholders like `${ALLURE_REPORT_URL}` are expanded from environment variables at runtime (see below).

For Allure 3, set `enableSuitesPublishing: true` only together with `allureResultsFolder` (suites JSON is synthesized from `*-result.json` when `widgets/suites.json` is absent). See [migration-5.0.md](migration-5.0.md#suites-publishing-enablesuitespublishing).

## Environment variables

| Variable | Maps to | Typical source |
|----------|---------|----------------|
| `ALLURE_REPORT_URL` | `links.report` | Published Allure report URL |
| `ALLURE_DASHBOARD_URL` | `links.dashboard` | Allure Dashboard / custom dashboard |
| `ALLURE_JOB_RUN_URL` | `links.testops` | Allure TestOps job run |
| `BUILD_URL` | `links.build` | Jenkins `$BUILD_URL` or GHA run URL |
| `TELEGRAM_BOT_TOKEN` | `telegram.token` | BotFather secret |
| `TELEGRAM_CHAT_ID` | `telegram.chat` | Chat / channel id |
| `JOB_BASE_NAME` | `base.project` | Jenkins job name |
| `STAND` | `base.environment` | Target environment name |

## GitHub Actions

```yaml
- name: Send Allure notification
  if: always()
  env:
    ALLURE_REPORT_URL: ${{ steps.deploy.outputs.report_url }}
    ALLURE_DASHBOARD_URL: ${{ vars.ALLURE_DASHBOARD_URL }}
    ALLURE_JOB_RUN_URL: ${{ vars.ALLURE_TESTOPS_RUN_URL }}
    BUILD_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
    JOB_BASE_NAME: ${{ github.workflow }}
    STAND: staging
  run: |
    java \
      "-DconfigFile=notifications/config.json" \
      "-Dnotifications.base.links.report=${ALLURE_REPORT_URL}" \
      "-Dnotifications.base.links.dashboard=${ALLURE_DASHBOARD_URL}" \
      "-Dnotifications.base.links.testops=${ALLURE_JOB_RUN_URL}" \
      "-Dnotifications.base.links.build=${BUILD_URL}" \
      "-Dnotifications.base.chart.mode=collage" \
      "-Dnotifications.telegram.token=${TELEGRAM_BOT_TOKEN}" \
      "-Dnotifications.telegram.chat=${TELEGRAM_CHAT_ID}" \
      -jar notifications/allure-notifications-5.0.2.jar
```

**Prerequisites**

- `summary.json` exists under `build/allure-report/` (Allure 2: `widgets/summary.json`, Allure 3: `summary.json`).
- `build/allure-results/` contains `*-result.json` files (for pyramid / durations panels).
- Secrets are not committed — override messenger tokens via `-D` flags or CI secret injection.

## Jenkins (post-build)

**1. Create `notifications/config.json`** (Create/Update Text File build step) using the example above.

**2. Post-build task — download jar**

```bash
cd "${WORKSPACE}/.."
FILE=allure-notifications-5.0.2.jar
if [ ! -f "$FILE" ]; then
  wget -q "https://github.com/qa-guru/allure-notifications/releases/download/v5.0.2/${FILE}"
fi
```

**3. Post-build task — send notification**

```bash
java \
  "-DconfigFile=${WORKSPACE}/notifications/config.json" \
  "-Dnotifications.base.project=${JOB_BASE_NAME}" \
  "-Dnotifications.base.environment=${STAND}" \
  "-Dnotifications.base.links.report=${ALLURE_REPORT_URL}" \
  "-Dnotifications.base.links.dashboard=${ALLURE_DASHBOARD_URL}" \
  "-Dnotifications.base.links.testops=${ALLURE_JOB_RUN_URL}" \
  "-Dnotifications.base.links.build=${BUILD_URL}" \
  "-Dnotifications.base.chart.mode=collage" \
  "-Dnotifications.telegram.token=${TELEGRAM_BOT_TOKEN}" \
  "-Dnotifications.telegram.chat=${TELEGRAM_CHAT_ID}" \
  -jar "${WORKSPACE}/../allure-notifications-5.0.2.jar"
```

Set `ALLURE_REPORT_URL`, `TELEGRAM_*`, etc. as Jenkins credentials or injected env vars.

## Pie mode (4.x compatible) in CI

Omit `chart.mode` or set `pie` explicitly — no `allureResultsFolder` required:

```shell
java "-DconfigFile=notifications/config.json" \
  "-Dnotifications.base.links.report=${ALLURE_REPORT_URL}" \
  -jar notifications/allure-notifications-5.0.2.jar
```

## Allure 3 note

Point `allureFolder` at the generated report directory. The library reads `summary.json` at the report root; no need to copy into `widgets/` for 5.0.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| No chart attached | `enableChart: true`; `summary.json` exists |
| Pyramid shows suites bar | No `layer` labels in `*-result.json` — expected with `pyramidFallback: suites` |
| Empty durations panel | `allureResultsFolder` path wrong or results not generated |
| `summary.json not found` | `allureFolder` path; run `allure generate` before notification step |
| Links missing in message | URL empty after env expansion; verify CI secrets / `-D` overrides |
