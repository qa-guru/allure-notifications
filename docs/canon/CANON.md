# allure-notifications collage canon (locked)

**Product pin:** monorepo `docs/allure-notifications/VERSION` → **6.0.12** (`npx allure-notifications`)  
**Classic visual lock:** [v5.0.3](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.3) 3-tile PNG (pixel gate)

## Showcase lock (Telegram CB-870 readme-hero / dogfood-full)

Asset: [`collage-cb870-readme-hero-dogfood.png`](./collage-cb870-readme-hero-dogfood.png)  
Config SSOT: [`config/config.dogfood-telegram-full.json`](../../config/config.dogfood-telegram-full.json)  
Aliases: `config.preview-cb870-readme-hero.json` · `config.preview-cb870-compact-hero.json` · `config/chart-telegram-cb870-readme-hero.png`

| Rule | Value |
|------|--------|
| Layout | `chart.layout: "free"` · **7 tiles** on 10×10 |
| Canvas | **870×1080** · `headerHeight` 56 · `cardGap` 14 · `tilePad` 6 |
| Theme | `base.darkMode: true` |
| History | `packages/core/test/fixtures/history-dogfood-full.jsonl` |
| Items | pie 5×4 · statusDynamics 5×4 · pyramid 4×3 · durations-by-layer 6×3 · successRate 3×3 · durationDynamics 4×3 · statusTransitions 3×3 |

Builder `DEFAULT_ITEMS` (4-tile) stays separate — this is the **Telegram / README showcase**.

**Caption (real report):** HTML text under the collage — environment · comment · duration · statistic counters · `base.links` (`report` / `dashboard` / `testops` / `build`).  
Preview bubble: [`docs/preview/notification-example.html`](../preview/notification-example.html) · asset [`docs/notification-example.png`](../notification-example.png).

## Visual lock (Telegram CB-870 free post · classic 3-tile)

Asset: [`collage-cb870-free-dogfood-5.0.3.png`](./collage-cb870-free-dogfood-5.0.3.png)  
Alias: [`collage-cb870-free-dogfood.png`](./collage-cb870-free-dogfood.png)

| Rule | Value |
|------|--------|
| Layout | `chart.layout: "free"` + `items` (pie 5×5, pyramid 5×5, durations 10×5) |
| Canvas (TG post) | 1024×1280 |
| Theme | `base.darkMode: true` |
| Card header | 68px traffic-light + title (`chart.headerHeight`, default 68) |
| Card gap | 14px around/between cards (`chart.cardGap` since 5.0.4, default 14 — lock unchanged) |
| Pyramid corners | `CORNER_RATIO = 0.18` (quiet, not capsule) |
| Pyramid gaps | `TIER_GAP_RATIO = 0.11` |
| Single-layer pyramid | compact centred tier (not full-bleed) |
| Pyramid `unit` | **same object as pie success** — `ChartTheme.STATUS_PASSED` / `#94ca66` |
| Bar charts | rounded tops (`Bars.fillTopRounded`) / suites pills |

## Palette SSOT

- Layers + pie status: `stacks/java-spring/tests/allure/pyramid-layers.json`
- `unit.light` / `unit.dark` = `#94ca66` (Allure 3 passed)
- Guard: `python scripts/pyramid_palette_sync.py --check`

## Do not regress

1. Do **not** reintroduce a separate “accessible” green for `unit` that drifts from pie success.
2. Do **not** ship consumer configs without `base.darkMode: true` for Monitoring dogfood.
3. Pin consumers to monorepo `docs/allure-notifications/VERSION` (**6.0.12** CLI). Legacy jar: **5.0.8**.
4. Do **not** swap dogfood-full / README hero footer back to `testResultSeverities` + wide `successRate`.
