# @qa-guru/allure-notifications-core

Allure 3 **summary/results → native collage PNG buffer** for line **6.0.\***.

## Native PNG (locked)

Production collage uses **[`@napi-rs/canvas`](https://github.com/Brooooood/canvas)** (Skia via N-API).

| | |
|--|--|
| **Runtime PNG** | `@napi-rs/canvas` only |
| **Not used** | Playwright, Puppeteer, Sharp-as-draw, browser screenshot |
| **Playwright** | tests only (elsewhere — builder e2e); never production render |

Depends on `@qa-guru/allure-notifications-config` + `@qa-guru/allure-notifications-pyramid`
(`CORNER_RATIO` / `TIER_GAP_RATIO`, `STATUS_COLORS.passed` = `#94ca66`).

## API

```ts
import { parseConfig } from "@qa-guru/allure-notifications-config";
import { renderCollagePng, loadReportAnalytics } from "@qa-guru/allure-notifications-core";

const config = parseConfig(/* config.json */);
const analytics = await loadReportAnalytics(config);
const png: Buffer = await renderCollagePng(config, analytics);
```

Free-layout collage panels:

| Kind | Types |
|------|--------|
| **Real (analytics)** | `currentStatus` · `testingPyramid` · `durations` (+ `groupBy: layer`) · `testResultSeverities` (aliases `severities`/`severity`) · `suites` · `statusDynamics` · `successRateDistribution` · `statusTransitions` · `testBaseGrowthDynamics` · `coverageDiff` · `problemsDistribution` (`by: environment`) · `stabilityDistribution` (`groupBy: feature\|epic\|story\|label-name:component`) · `durationDynamics` · `statusAgePyramid` |
| **Empty-state** | Unknown tile types → themed card (`No data yet`), **not** silent-drop. Real panels keep the tile with an honest caption when their series is missing (`No history data` / `No environment data` / …). |

**History source** (Java `HistoryAnalytics` / `ReportAnalyticsBuilder` parity + A3 catalog series): Allure 3 `history.jsonl` via `chart.historyPath` or auto-discover next to report/results (and parents). Typical A3 lines carry `status`, `duration`/`start`/`stop`, `environment`, and `labels` — used for transitions, growth, coverage, problems-by-env, duration trend, age pyramid, and stability. Minimal history (`id`+`status` only) still drives transitions / growth / age; duration / environment / labeled coverage→empty captions. Without history → history panels show **"No history data"** (tile kept). `stabilityDistribution` can fall back to current `*-result.json` labels. `pyramidFallback: "suites"` → real `SuitesPanel` when no known layers.

## Verify

```bash
pnpm --filter @qa-guru/allure-notifications-core test
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
