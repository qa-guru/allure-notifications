#!/usr/bin/env bash
# Q4 Telegram collage: dry-run (PR) / live (master + workflow_dispatch).
# Always this run's allure-report + allure-results (no dogfood fixture fallback).
# Env:
#   MODE=dry-run|live|skip
#   TELEGRAM_BOT_TOKEN | TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_TOPIC_ID (live)
#   BUILD_URL, REF_NAME, SHORT_SHA (optional links / project label)
# Pin: npx @qa-guru/allure-notifications@6.0.14.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${MODE:-dry-run}"
CLI_PIN="${CLI_PIN:-6.0.13}"
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
REASON="this-run"

if [[ ! -f allure-report/summary.json ]]; then
  echo "ERROR: allure-report/summary.json missing — generate this-run report first (pnpm test && pnpm allure:generate)" >&2
  echo "source=missing-report" >> "${GITHUB_OUTPUT:-/dev/null}"
  echo "mode=${MODE}" >> "${GITHUB_OUTPUT:-/dev/null}"
  echo "reason=missing-summary" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 1
fi

echo "==> using this run's allure-report (+ allure-results)"

REF_NAME="${REF_NAME:-local}"
SHORT_SHA="${SHORT_SHA:-0000000}"
SHORT_SHA="${SHORT_SHA:0:7}"
BUILD_URL="${BUILD_URL:-}"

python - "$TEMPLATE" "$RUNTIME_CONFIG" "$SOURCE" "$REF_NAME" "$SHORT_SHA" "$BUILD_URL" "$REASON" <<'PY'
import json, os, sys
from pathlib import Path

template, out, source, ref, sha, build, reason = sys.argv[1:8]
cfg = json.loads(Path(template).read_text())
cfg["base"]["project"] = f"allure-notifications · {ref} · {sha}"
cfg["base"]["environment"] = "CI"
cfg["base"]["language"] = cfg["base"].get("language") or "ru"
cfg["base"]["comment"] = "Q4 quality contour · this-run Allure"

cfg["base"]["allureFolder"] = "../allure-report"
cfg["base"]["allureResultsFolder"] = "../allure-results"
chart = cfg["base"].setdefault("chart", {})
chart.pop("historyPath", None)

# Realistic caption links (telegram.ftl parity). Prefer CI env; keep template defaults.
links = cfg["base"].setdefault("links", {})
endpoint = (os.environ.get("ALLURE_ENDPOINT") or "https://allure.qa.guru").rstrip("/")
project_id = (os.environ.get("ALLURE_PROJECT_ID") or "").strip()
testops = f"{endpoint}/project/{project_id}" if project_id else f"{endpoint}/project/5297"
links.setdefault("report", testops)
links.setdefault("testops", testops)
links.setdefault(
    "dashboard",
    os.environ.get("SONAR_DASHBOARD_URL")
    or "https://sonar.qa.guru/dashboard?id=allure-notifications",
)
if build:
    links["build"] = build
else:
    links.setdefault(
        "build",
        "https://github.com/qa-guru/allure-notifications/actions",
    )

# Credentials stay empty in file — CLI resolves TELEGRAM_* from env (never commit).
tg = cfg.setdefault("telegram", {})
tg["token"] = ""
tg["chat"] = ""
tg["topic"] = ""
tg["replyTo"] = ""

Path(out).write_text(json.dumps(cfg, indent=2) + "\n")
print(f"wrote {out} (source={source} reason={reason})")
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

echo "==> npx @qa-guru/allure-notifications@${CLI_PIN} send --config ${RUNTIME_CONFIG} ${FLAG}"
set +e
SEND_LOG="$(mktemp)"
npx --yes "@qa-guru/allure-notifications@${CLI_PIN}" send \
  --config "$RUNTIME_CONFIG" \
  $FLAG \
  --out "$OUT_PNG" 2>&1 | tee "$SEND_LOG"
SEND_EXIT=${PIPESTATUS[0]}
set -e

MESSAGE_ID="$(grep -Eo 'message_id=[0-9]+' "$SEND_LOG" | head -1 | cut -d= -f2 || true)"
{
  echo "source=${SOURCE}"
  echo "mode=${MODE}"
  echo "reason=${REASON}"
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
