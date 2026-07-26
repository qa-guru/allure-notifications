#!/usr/bin/env python
"""Vendored thin copy of monorepo scripts/sonar-gate-wait.py (self-contained).

Nested CI has no monorepo scripts/ — keep this file in sync when the gate poll
contract changes. Canon: docs/sonar/SONAR-CANON.md · QUALITY-CONTOUR §4.

Smoke: python scripts/sonar-gate-wait.py --project-key allure-notifications --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def emit(result: dict, *, exit_code: int | None = None) -> None:
    print(json.dumps(result, ensure_ascii=False))
    if exit_code is not None:
        sys.exit(exit_code)
    sys.exit(0 if result.get("ok", False) else 1)


def usage_error(message: str) -> None:
    print(message, file=sys.stderr)
    emit({"ok": False, "error": message}, exit_code=2)


def fetch_gate_status(base_url: str, project_key: str, token: str) -> dict:
    qs = urllib.parse.urlencode({"projectKey": project_key})
    url = f"{base_url.rstrip('/')}/api/qualitygates/project_status?{qs}"
    req = urllib.request.Request(url)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    project_status = payload.get("projectStatus", {})
    status = project_status.get("status", "UNKNOWN")
    conditions = project_status.get("conditions", [])
    return {
        "status": status,
        "conditions": conditions,
        "dashboard_url": f"{base_url.rstrip('/')}/dashboard?id={urllib.parse.quote(project_key)}",
    }


def run(url: str, project_key: str, timeout: int, poll: int, dry_run: bool) -> dict:
    if dry_run:
        return {
            "ok": True,
            "dry_run": True,
            "status": "PASSED",
            "project_key": project_key,
            "url": url,
            "conditions": [],
            "dashboard_url": f"{url.rstrip('/')}/dashboard?id={project_key}",
        }

    token = os.environ.get("SONAR_TOKEN", "")
    if not token:
        return {
            "ok": False,
            "error": "SONAR_TOKEN not set (use --dry-run for local smoke)",
            "project_key": project_key,
        }

    deadline = time.monotonic() + timeout
    last: dict | None = None
    while time.monotonic() < deadline:
        try:
            last = fetch_gate_status(url, project_key, token)
        except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as exc:
            last = {"status": "ERROR", "error": str(exc)}
        else:
            if last["status"] in ("OK", "PASSED", "FAILED", "ERROR"):
                break
        time.sleep(poll)

    if last is None:
        return {"ok": False, "error": "no response from Sonar", "project_key": project_key}

    status = last.get("status", "UNKNOWN")
    passed = status in ("OK", "PASSED")
    return {
        "ok": passed,
        "status": status,
        "project_key": project_key,
        "conditions": last.get("conditions", []),
        "dashboard_url": last.get("dashboard_url"),
        "timed_out": status not in ("OK", "PASSED", "FAILED", "ERROR"),
    }


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Poll sonar.qa.guru quality gate until PASSED/FAILED.")
    parser.add_argument("--url", default="https://sonar.qa.guru")
    parser.add_argument("--project-key", required=True)
    parser.add_argument("--timeout", type=int, default=600)
    parser.add_argument("--poll", type=int, default=15)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    if not args.project_key.strip():
        usage_error("--project-key is required")

    result = run(args.url, args.project_key, args.timeout, args.poll, args.dry_run)
    emit(result)


if __name__ == "__main__":
    main()
