#!/usr/bin/env python
"""Dogfood: builder CB-870 free export shape → allure-notifications jar → PNG 870×1080.

Requires nested monorepo layout (apps/builder → repo root):
  ../../allure-notifications/build/libs/allure-notifications-*.jar
  ../../build/pyramid-showcase/{allure-report,allure-results}

Skip with exit 0 if jar/fixtures missing (local UI-only CI).
Force fail if missing: ANB_DOGFOOD_REQUIRED=1
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None  # type: ignore

ROOT = Path(__file__).resolve().parents[1]
# apps/builder → allure-notifications repo → hub
AN = ROOT.parents[1]
HUB = AN.parent
SHOWCASE = AN / "build" / "pyramid-showcase"
JAR_GLOB = "allure-notifications/build/libs/allure-notifications-*.jar"

CB870_ITEMS = [
    {"type": "currentStatus", "x": 0, "y": 0, "w": 5, "h": 5},
    {"type": "testingPyramid", "x": 5, "y": 0, "w": 5, "h": 5},
    {"type": "durations", "x": 0, "y": 5, "w": 10, "h": 5},
]


def find_jar() -> Path | None:
    env = os.environ.get("ALLURE_NOTIFICATIONS_JAR")
    if env:
        p = Path(env)
        return p if p.is_file() else None
    libs = AN / "allure-notifications" / "build" / "libs"
    if not libs.is_dir():
        return None
    jars = sorted(libs.glob("allure-notifications-*.jar"), reverse=True)
    # Prefer non-api fat jar
    jars = [j for j in jars if "api" not in j.name]
    return jars[0] if jars else None


def builder_shaped_config(allure_report: Path, allure_results: Path) -> dict:
    return {
        "base": {
            "project": "builder-dogfood-cb870",
            "environment": "autotest",
            "comment": "tests/dogfood_jar.py — builder DEFAULT_ITEMS / CANON CB-870",
            "language": "en",
            "allureFolder": str(allure_report) + "/",
            "allureResultsFolder": str(allure_results) + "/",
            "enableChart": True,
            "darkMode": True,
            "chart": {
                "mode": "collage",
                "layout": "free",
                "width": 870,
                "height": 1080,
                "headerHeight": 68,
                "cardGap": 14,
                "gridCols": 10,
                "gridRows": 10,
                "items": list(CB870_ITEMS),
                "pyramidFallback": "suites",
            },
            "links": {"report": "", "dashboard": "", "testops": "", "build": ""},
        },
        "telegram": {
            "token": "0:preview-no-send",
            "chat": "0",
            "templatePath": "/templates/telegram.ftl",
        },
    }


def main() -> int:
    required = os.environ.get("ANB_DOGFOOD_REQUIRED") == "1"
    jar = find_jar()
    report = SHOWCASE / "allure-report"
    results = SHOWCASE / "allure-results"
    if not jar or not results.is_dir():
        msg = (
            f"skip dogfood_jar: jar={jar} results={results.is_dir()} "
            f"(set ANB_DOGFOOD_REQUIRED=1 to fail)"
        )
        print(msg)
        return 1 if required else 0

    cfg = builder_shaped_config(report, results)
    with tempfile.TemporaryDirectory(prefix="anb-dogfood-") as tmp:
        tmp_path = Path(tmp)
        cfg_path = tmp_path / "config.json"
        cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
        chart_path = tmp_path / "chart.png"
        # Jar writes chart.png next to configFile
        env = {
            **os.environ,
            "ZDS_HEADLESS": "1",
            "JAVA_TOOL_OPTIONS": "-Dorg.slf4j.simpleLogger.defaultLogLevel=warn",
        }
        proc = subprocess.run(
            [
                "java",
                f"-DconfigFile={cfg_path}",
                "-cp",
                str(jar),
                "guru.qa.allure.notifications.chart.CollageRenderMain",
            ],
            cwd=str(tmp_path),
            capture_output=True,
            text=True,
            check=False,
            env=env,
        )
        if proc.returncode != 0:
            print("jar failed", proc.returncode)
            print(proc.stdout[-1500:])
            print(proc.stderr[-1500:])
            return 1
        if not chart_path.is_file():
            # Some versions write under config dir name
            alt = list(tmp_path.glob("**/chart.png"))
            if not alt:
                print("chart.png missing after jar run")
                return 1
            chart_path = alt[0]

        if Image is None:
            print("PIL missing — size check skipped; chart exists:", chart_path)
            return 0

        img = Image.open(chart_path)
        w, h = img.size
        print(f"dogfood OK: {chart_path} {w}×{h} bytes={chart_path.stat().st_size}")
        if (w, h) != (870, 1080):
            print(f"unexpected size {w}×{h}, want 870×1080")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
