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

Stage C scope: free-layout collage with **pie** / **testingPyramid** / **durations**
(+ empty-state stubs for other catalog tiles). Messengers / CLI = Stage D.

## Verify

```bash
pnpm --filter @allure-notifications/core test
```

Canon: monorepo `docs/allure-notifications/canon/CANON.md` +
`collage-cb870-free-dogfood-5.0.3.png`.
