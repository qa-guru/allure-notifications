# @allure-notifications/core

Allure 3 **summary/results → native collage PNG buffer** for line **6.0.\***.

## Native PNG (locked)

Production collage uses **[`@napi-rs/canvas`](https://github.com/Brooooood/canvas)** (Skia via N-API).

| | |
|--|--|
| **Runtime PNG** | `@napi-rs/canvas` only |
| **Not used** | Playwright, Puppeteer, Sharp-as-draw, browser screenshot |
| **Playwright** | tests only (elsewhere — builder e2e); never production render |

Depends on `@allure-notifications/config` + `@allure-notifications/pyramid`
(`CORNER_RATIO` / `TIER_GAP_RATIO`, `STATUS_COLORS.passed` = `#94ca66`).

## API

```ts
import { parseConfig } from "@allure-notifications/config";
import { renderCollagePng, loadReportAnalytics } from "@allure-notifications/core";

const config = parseConfig(/* config.json */);
const analytics = await loadReportAnalytics(config);
const png: Buffer = await renderCollagePng(config, analytics);
```

Free-layout collage panels:

| Kind | Types |
|------|--------|
| **Real (analytics)** | `pie` (alias `currentStatus`) · `testingPyramid` · `durations` (+ `groupBy: layer`) · `testResultSeverities` (aliases `severities`/`severity`) · `suites` · `statusDynamics` · `successRateDistribution` |
| **Empty-state stubs** | Remaining catalog: `statusTransitions`, `testBaseGrowthDynamics`, `coverageDiff`, `problemsDistribution`, `stabilityDistribution`, `durationDynamics`, `statusAgePyramid` + unknown → themed card (`No data yet`), **not** silent-drop |

**History source** (Java `HistoryAnalytics` / `ReportAnalyticsBuilder` parity): Allure 3 `history.jsonl` via `chart.historyPath` or auto-discover next to report/results (and parents). Without history → `statusDynamics` / `successRateDistribution` show **"No history data"** (tile kept). `pyramidFallback: "suites"` → real `SuitesPanel` when no known layers.

## Verify

```bash
pnpm --filter @allure-notifications/core test
```

Canon: monorepo `docs/allure-notifications/canon/CANON.md` +
`collage-cb870-free-dogfood-5.0.3.png`.

### Visual gate (dogfood vs Java CB-870)

| Check | Threshold |
|-------|-----------|
| Full-frame pixel match | sample **128×160**, RGB **Δ≤28**, floor **≥0.90** |
| aHash 16×16 | Hamming **≤40** / 256 |
| Panel regions (pie / pyramid / durations) | crop→**64×80**, Δ≤30, floor **≥0.85** |
| Palette | unit green `#94ca66` count **>500**; outer bg `#222` **>100** |

Fail-closed when `docs/allure-notifications/canon/` is present (zds/CI).
Silent skip only outside zds (standalone GH checkout without that tree).
Playwright is never used for PNG production render.
