#!/usr/bin/env bash
# Soft Sonar upload + quality gate poll for allure-notifications (Q2).
# Soft-skip when: fork / no SONAR_TOKEN / host down / gate ≠ PASSED (unless SONAR_REQUIRED=true).
# Env: SONAR_TOKEN, SONAR_HOST_URL (default https://sonar.qa.guru), SONAR_REQUIRED (default false)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export SONAR_HOST_URL="${SONAR_HOST_URL:-https://sonar.qa.guru}"
export SONAR_PROJECT_KEY="${SONAR_PROJECT_KEY:-allure-notifications}"
export SONAR_REQUIRED="${SONAR_REQUIRED:-false}"

soft_skip() {
  local msg="$1"
  if [[ "$SONAR_REQUIRED" == "true" ]]; then
    echo "ERROR: $msg (SONAR_REQUIRED=true)" >&2
    exit 1
  fi
  echo "WARNING: $msg — soft-skip (SONAR_REQUIRED=false)"
  exit 0
}

if [[ "${IS_FORK:-}" == "true" ]]; then
  soft_skip "fork PR — never pass SONAR_TOKEN / skip scan"
fi

if [[ -z "${SONAR_TOKEN:-}" ]]; then
  soft_skip "SONAR_TOKEN unset — skip sonar upload"
fi

if ! curl -sf --max-time 15 "${SONAR_HOST_URL%/}/api/system/status" >/dev/null; then
  soft_skip "Sonar host unreachable: ${SONAR_HOST_URL}"
fi

if [[ ! -f coverage/lcov.info ]]; then
  soft_skip "coverage/lcov.info missing — run pnpm coverage / download artifact first"
fi

echo "==> sonar-scanner → ${SONAR_HOST_URL} (${SONAR_PROJECT_KEY})"
# Token via env only (never argv / logs). @sonar/scan reads SONAR_TOKEN + SONAR_HOST_URL.
npx --yes @sonar/scan \
  -Dsonar.projectKey="${SONAR_PROJECT_KEY}" \
  -Dsonar.projectName="${SONAR_PROJECT_KEY}"
echo "==> quality gate poll"
if command -v python >/dev/null 2>&1; then
  PY=python
elif command -v python3 >/dev/null 2>&1; then
  PY=python3
else
  soft_skip "no python for gate poll"
fi

set +e
"$PY" scripts/sonar-gate-wait.py \
  --url "${SONAR_HOST_URL}" \
  --project-key "${SONAR_PROJECT_KEY}"
gate_ec=$?
set -e

if [[ $gate_ec -eq 0 ]]; then
  echo "OK: quality gate PASSED"
  exit 0
fi

soft_skip "quality gate not PASSED (exit=${gate_ec})"
