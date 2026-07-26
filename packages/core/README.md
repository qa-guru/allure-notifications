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
| **Real (analytics)** | `pie` (alias `currentStatus`) · `testingPyramid` · `durations` (+ `groupBy: layer`) |
| **Empty-state stubs** | Remaining `PANEL_CATALOG` slots + any unknown type → themed card (`No data yet`), **not** silent-drop |

Empty-state body mirrors Java `EmptyStatePanel` (theme background, muted caption, marker bar).
Card header title comes from `resolvePanelMeta` / `PANEL_CATALOG`. Full analytics for
`statusDynamics` / `successRateDistribution` / `testResultSeverities` / suites = later OK.

## Verify

```bash
pnpm --filter @allure-notifications/core test
```

Canon: monorepo `docs/allure-notifications/canon/CANON.md` +
`collage-cb870-free-dogfood-5.0.3.png`.
