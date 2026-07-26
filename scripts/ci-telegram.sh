#!/usr/bin/env bash
# Q4 Telegram collage: dry-run (PR) / live (master + workflow_dispatch).
# Prefer this run's allure-report/results; fallback dogfood CB-870.
# Env:
#   MODE=dry-run|live|skip
#   TELEGRAM_BOT_TOKEN | TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_TOPIC_ID (live)
#   BUILD_URL, REF_NAME, SHORT_SHA (optional links / project label)
# Pin: npx allure-notifications@6.0.5 (docs/allure-notifications/VERSION).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${MODE:-dry-run}"
CLI_PIN="${CLI_PIN:-6.0.5}"
OUT_PNG="${OUT_PNG:-collage-telegram.png}"
RUNTIME_CONFIG="${RUNTIME_CONFIG:-config/ci-telegram.runtime.json}"

if [[ "$MODE" == "skip" ]]; then
  echo "soft-skip: MODE=skip"
  echo "source=skip" >> "${GITHUB_OUTPUT:-/dev/null}"
  echo "mode=skip" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

if [[ "$MODE" != "dry-run" && "$MODE" != "live" ]]; then
  echo "ERROR: MODE must be dry-run|live|skip (got: $MODE)" >&2
  exit 1
fi

TEMPLATE="config/ci-telegram.json"
SOURCE="run-allure-report"
if [[ -f allure-report/summary.json ]]; then
  echo "==> using this run's allure-report (+ allure-results if present)"
else
  SOURCE="dogfood-cb870"
  echo "==> allure-report/summary.json missing — fallback dogfood CB-870"
fi

REF_NAME="${REF_NAME:-local}"
SHORT_SHA="${SHORT_SHA:-0000000}"
SHORT_SHA="${SHORT_SHA:0:7}"
BUILD_URL="${BUILD_URL:-}"

python - "$TEMPLATE" "$RUNTIME_CONFIG" "$SOURCE" "$REF_NAME" "$SHORT_SHA" "$BUILD_URL" <<'PY'
import json, sys
from pathlib import Path

template, out, source, ref, sha, build = sys.argv[1:7]
cfg = json.loads(Path(template).read_text())
cfg["base"]["project"] = f"allure-notifications · {ref} · {sha}"
cfg["base"]["environment"] = "CI"
cfg["base"]["comment"] = (
    "Q4 quality contour · this-run Allure"
    if source == "run-allure-report"
    else "Q4 quality contour · dogfood CB-870 fallback"
)
if source == "dogfood-cb870":
    # Paths relative to config/ (same as TEMPLATE dir).
    cfg["base"]["allureFolder"] = "../packages/core/test/fixtures/dogfood-report"
    cfg["base"]["allureResultsFolder"] = "../packages/core/test/fixtures/dogfood-results"
else:
    cfg["base"]["allureFolder"] = "../allure-report"
    cfg["base"]["allureResultsFolder"] = "../allure-results"

links = cfg["base"].setdefault("links", {})
if build:
    links["build"] = build

# Credentials stay empty in file — CLI resolves TELEGRAM_* from env (never commit).
tg = cfg.setdefault("telegram", {})
tg["token"] = ""
tg["chat"] = ""
tg["topic"] = ""
tg["replyTo"] = ""

Path(out).write_text(json.dumps(cfg, indent=2) + "\n")
print(f"wrote {out} (source={source})")
PY

FLAG="--dry-run"
if [[ "$MODE" == "live" ]]; then
  FLAG="--live"
  TOKEN="${TELEGRAM_BOT_TOKEN:-${TELEGRAM_TOKEN:-}}"
  if [[ -z "$TOKEN" ]]; then
    echo "WARNING: live requested but TELEGRAM_BOT_TOKEN/TELEGRAM_TOKEN unset — soft-skip"
    echo "source=${SOURCE}" >> "${GITHUB_OUTPUT:-/dev/null}"
    echo "mode=skip" >> "${GITHUB_OUTPUT:-/dev/null}"
    echo "reason=missing-token" >> "${GITHUB_OUTPUT:-/dev/null}"
    exit 0
  fi
  # Normalize for CLI (supports both names).
  export TELEGRAM_BOT_TOKEN="$TOKEN"
  export TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:--1004381150566}"
  export TELEGRAM_TOPIC_ID="${TELEGRAM_TOPIC_ID:-${TELEGRAM_ALLURE_NOTIFICATIONS_TOPIC_ID:-34}}"
fi

echo "==> npx allure-notifications@${CLI_PIN} send --config ${RUNTIME_CONFIG} ${FLAG}"
set +e
SEND_LOG="$(mktemp)"
npx --yes "allure-notifications@${CLI_PIN}" send \
  --config "$RUNTIME_CONFIG" \
  $FLAG \
  --out "$OUT_PNG" 2>&1 | tee "$SEND_LOG"
SEND_EXIT=${PIPESTATUS[0]}
set -e

MESSAGE_ID="$(grep -Eo 'message_id=[0-9]+' "$SEND_LOG" | head -1 | cut -d= -f2 || true)"
{
  echo "source=${SOURCE}"
  echo "mode=${MODE}"
  echo "send_exit=${SEND_EXIT}"
  if [[ -n "${MESSAGE_ID}" ]]; then
    echo "message_id=${MESSAGE_ID}"
  fi
  if [[ -f "$OUT_PNG" ]]; then
    echo "collage=${OUT_PNG}"
  fi
} >> "${GITHUB_OUTPUT:-/dev/null}"

if [[ "$SEND_EXIT" -ne 0 ]]; then
  if [[ "$MODE" == "dry-run" ]]; then
    echo "ERROR: dry-run wiring failed (exit ${SEND_EXIT}) — fix config/CLI path" >&2
    exit "$SEND_EXIT"
  fi
  echo "WARNING: live send failed (exit ${SEND_EXIT}) — not a merge blocker" >&2
  exit 0
fi

echo "OK: telegram ${MODE} (source=${SOURCE}${MESSAGE_ID:+ message_id=${MESSAGE_ID}})"
