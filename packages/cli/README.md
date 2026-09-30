# allure-notifications (CLI)

Public npm bin **`@qa-guru/allure-notifications`** for line **6.0.\***.

```bash
npx @qa-guru/allure-notifications@6.2.3 send --config config.json --dry-run
npx @qa-guru/allure-notifications@6.2.3 send --config config.json \
  --allure-folder build/reports/allure-report/allureReport/awesome \
  --allure-results-folder build/allure-results \
  --project Multistack \
  --build-url "$BUILD_URL" \
  --live
```

| Flag | Role |
|------|------|
| `send --config <path>` | Load config, collage via `@qa-guru/allure-notifications-core` |
| `--dry-run` | Render PNG; list messengers that *would* send; **no network** (default) |
| `--mock` | Render PNG; record mock deliveries; **no network** |
| `--live` | Live Telegram `sendPhoto` (ADR 008); needs env token |
| `--out <path>` | Write PNG buffer to disk |
| `--allure-folder`, `--allure-results-folder` | Override report/results paths from the consumer cwd |
| `--project` | Override `base.project` |
| `--report-url`, `--dashboard-url`, `--testops-url`, `--build-url` | Override `base.links` |

Default without `--mock` / `--live` is safe **dry-run**. Live credentials: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID` — see [`docs/telegram-dogfood.md`](../../docs/telegram-dogfood.md).

Relative paths stored in config resolve from the config file directory.
Relative path overrides resolve from the process cwd. Overrides are applied in
memory; `send` never writes a runtime config or copies credentials into JSON.

## Offline `suggest` (workspace / pre-release)

```bash
pnpm build
pnpm exec allure-notifications suggest --results packages/core/test/fixtures/dogfood-results
pnpm exec allure-notifications suggest --results packages/core/test/fixtures/dogfood-results \
  --config config/config.dogfood-telegram-full.json --out suggested.json
pnpm exec allure-notifications suggest --results allure-results --profile default
```

| Flag | Role |
|------|------|
| `suggest --results <dir>` | Required raw results directory; no generated report required for suggestion |
| `--profile default\|kit` | Override automatic profile selection |
| `--config <path>` | Existing config as local summary/history/QG/payload facts; never modified |
| `--out <path>` / `--write <path>` | Create a new config JSON file instead of stdout; existing files are not overwritten |

The output contains only `base` (paths, canonical chart and dark mode), validated by
the same `parseConfig` used by `send`. Messenger blocks, credentials and unknown
metadata are not copied from `--config`. Without an output file, stdout is JSON only;
validation errors / warnings go to stderr. There is no PNG rendering, sending, LLM
or network I/O. Send modes and send-only overrides are rejected for `suggest`.

Counters come from a local or configured `summary.json` (`widgets/summary.json`
also works); without one they are derived from `*-result.json` statuses. History
is discovered as `history.jsonl` in results, their parent or the report directory,
not in an unrelated cwd. Explicit config paths win. Invalid/empty history records
are ignored; at least two usable runs are required for trend recommendations.

Neighbouring `allureQualityGate.json`, `sonarQualityGate.json` (raw Sonar
`projectStatus`) and `testsTable.json` are local payload facts. AQG / tests-table
widgets are also discovered under `widgets/kit-panels/`. Sonar widget payloads are
not treated as raw `projectStatus`. Paths in emitted JSON are absolute, so moving
`--out` does not change their resolution. Raw results still need `allure generate`
before `send` can read its summary. A QG chosen only from `qualityGate.rules` emits
a warning: provide its payload or generate the AQG report widget before sending.
`problemsDistribution` needs environment-labelled history to render its heatmap.

**Optional LLM advisor (tier 1, ADR 020):** disabled unless both env vars are set.
When enabled, compact signals go to an OpenAI-compatible `chat/completions`
endpoint, which answers with catalog panel ids; the reply is validated against
`PANEL_CATALOG` and materialized into the same canonical templates (the LLM
never picks coordinates). Timeout 15 s. Any error — HTTP, JSON, unknown id,
kit-only under `default` — falls back to the deterministic scorer with a
`warning:` on stderr. The LLM sees only compact signals, never raw results or
messenger secrets.

| Env | Role |
|-----|------|
| `ANB_AI_BASE_URL` | OpenAI-compatible base, e.g. `http://localhost:11434/v1` |
| `ANB_AI_MODEL` | Model name sent in the request |
| `ANB_AI_API_KEY` | Optional `Authorization: Bearer` key |

Template capacities and selection order: [config package](../config/README.md#deterministic-suggestions-tier-0).
Builder UI and automatic delivery are separate increments.

**Alternate (Allure 3 plugin):** same collage + messengers via `allurerc` `done` hook — [`examples/allurerc.notifications.mjs`](../../examples/allurerc.notifications.mjs) · [`packages/plugin/README.md`](../plugin/README.md). CLI pin stays primary for consumers.

Workspace (pre-publish / local):

```bash
ALLURE_RESULTS_DIR="$(mktemp -d)" pnpm --filter @qa-guru/allure-notifications test
pnpm exec allure-notifications send --config … --dry-run
```
