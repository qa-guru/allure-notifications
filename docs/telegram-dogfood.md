# Telegram dogfood (6.0 CLI · ADR 008)

Live `sendPhoto` of a CB-870 collage via `@allure-notifications/cli`.  
**Default CLI mode stays `--dry-run` / `--mock` (no network).** Live requires explicit `--live`.

## Canon (ADR 008)

| Item | Value |
|------|-------|
| Bot | `@qa_guru_monitoring_bot` |
| Chat | `-1004381150566` (Monitoring forum) |
| Topic | `allure-notifications` → id **34** (`docs/allure-notifications/topics.json` in monorepo) |
| Do **not** use | retired chat `-1001587609458` |

## Credentials (env only — never commit)

```bash
export TELEGRAM_BOT_TOKEN='…'          # or TELEGRAM_TOKEN
export TELEGRAM_CHAT_ID='-1004381150566'   # optional; ADR default if omitted
export TELEGRAM_TOPIC_ID='34'              # or TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID
```

Local tip: token may already live in gitignored `config/config.local.json` — copy into env, do not point `--live` at that file’s old chat id.

```bash
# example: load token from gitignored local config into env (do not commit)
export TELEGRAM_BOT_TOKEN="$(python -c 'import json;print(json.load(open("config/config.local.json"))["telegram"]["token"])')"
export TELEGRAM_CHAT_ID='-1004381150566'
export TELEGRAM_TOPIC_ID='34'
```

## One controlled send

From repo root (`feature/6.0-phase-0-1`):

```bash
pnpm install
pnpm --filter @allure-notifications/cli run build

node packages/cli/dist/src/bin.js send \
  --config packages/cli/test/fixtures/config.dogfood-cb870.json \
  --live \
  --out /tmp/an-6.0-dogfood-cb870.png
```

Fixture = CB-870 free (pie / pyramid / durations) against `packages/core` dogfood Allure fixtures.  
Stdout reports `[sent] telegram: … message_id=… chat=… topic=…` (no token).

Safe rehearsal (no network):

```bash
node packages/cli/dist/src/bin.js send \
  --config packages/cli/test/fixtures/config.dogfood-cb870.json \
  --dry-run \
  --out /tmp/an-6.0-dogfood-cb870.png
```

## Tests / CI

- Unit tests mock `fetch` — **no** live network in default `pnpm test`.
- Optional real send in tests: `ALLURE_NOTIFICATIONS_LIVE_TEST=1` + token env (off in CI).
- Quality contour **Q4**: job **`telegram`** in [`.github/workflows/ci-6.0.yml`](../.github/workflows/ci-6.0.yml) via [`scripts/ci-telegram.sh`](../scripts/ci-telegram.sh).
  - PR / feature: `npx allure-notifications@6.0.4 send --config … --dry-run` (+ optional collage artifact).
  - `master` + `workflow_dispatch`: `--live` when `TELEGRAM_*` present → topic **34**; else soft-skip.
  - Forks: never `--live`.
  - Config prefers this run’s `allure-report/` / `allure-results/`; fallback dogfood CB-870.

## See also

- ADR 008 · monorepo `docs/adr/008-allure-notifications-monitoring.md`
- CI cookbook: [`ci-cookbook.md`](ci-cookbook.md) (§ Telegram Q4)
- Hub plan: `projects/allure-notifications-home/PLAN-6.0.md`
- Instance contour: monorepo `docs/allure-notifications/QUALITY-CONTOUR.md`
