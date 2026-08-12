# allure-notifications collage canon (locked)

**Product pin:** monorepo `docs/allure-notifications/VERSION` → **6.0.12** (`npx allure-notifications`)  
**Classic visual lock:** [v5.0.3](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.3) 3-tile PNG (pixel gate — historical only)

## Active canon (6.x CLI / builder)

| Rule | Value |
|------|--------|
| Panel slot | **`currentStatus`** (catalog `ChartType`; not legacy slot name `pie`) |
| Canvas presets | **870×1080** · **1080×1080** · **1410×1080** (no 1024×1280 in active product) |
| Chrome | `headerHeight` **31** (`DEFAULT_HEADER_HEIGHT`, DS `--wt-bar-height`) · `cardGap` 14 · `tilePad` 6 |
| Default layout | `DEFAULT_ITEMS` — currentStatus 4×4 · durationDynamics 6×4 · testingPyramid 3×3 · durations-by-layer 4×3 |
| Theme | `base.darkMode: true` |

Builder `DEFAULT_ITEMS` (4-tile) = empty-canvas default. See [`apps/builder/CANON.md`](../../apps/builder/CANON.md).

## Showcase lock (Telegram CB-870 readme-hero / dogfood-full)

Asset: [`collage-cb870-readme-hero-dogfood.png`](./collage-cb870-readme-hero-dogfood.png)  
Config SSOT: [`config/config.dogfood-telegram-full.json`](../../config/config.dogfood-telegram-full.json)  
Aliases: `config.preview-cb870-readme-hero.json` · `config.preview-cb870-compact-hero.json` · `config/chart-telegram-cb870-readme-hero.png`

| Rule | Value |
|------|--------|
| Layout | `chart.layout: "free"` · **7 tiles** on 10×10 |
| Canvas | **870×1080** · `headerHeight` 31 · `cardGap` 14 · `tilePad` 6 |
| Theme | `base.darkMode: true` |
| History | `packages/core/test/fixtures/history-dogfood-full.jsonl` |
| Items | currentStatus 5×4 · statusDynamics 5×4 · testingPyramid 4×3 · durations-by-layer 6×3 · successRate 3×3 · durationDynamics 4×3 · statusTransitions 3×3 |

Not `DEFAULT_ITEMS` — this is the **Telegram / README showcase**.

**Caption (real report):** HTML text under the collage — environment · comment · duration · statistic counters · `base.links` (`report` / `dashboard` / `testops` / `build`).  
Preview bubble: [`docs/preview/notification-example.html`](../preview/notification-example.html) · asset [`docs/notification-example.png`](../notification-example.png).

## Historical — classic visual lock (v5.0.3 jar · pixel gate only)

**Not active product canon.** Legacy 3-tile CB-870 Telegram post kept for `packages/core/test/collage.test.ts` regression. Do **not** copy into new consumer configs.

Asset: [`collage-cb870-free-dogfood-5.0.3.png`](./collage-cb870-free-dogfood-5.0.3.png)  
Alias: [`collage-cb870-free-dogfood.png`](./collage-cb870-free-dogfood.png)

| Rule | Value (historical fixture only) |
|------|--------------------------------|
| Layout | `chart.layout: "free"` + `items` (legacy slot `pie` 5×5, pyramid 5×5, durations 10×5) |
| Canvas | **1024×1280** |
| Theme | `base.darkMode: true` |
| Card header | **68** px traffic-light + title (jar-era chrome; active default is 31) |
| Card gap | 14px around/between cards (`chart.cardGap` since 5.0.4, default 14 — lock unchanged) |
| Pyramid corners | `CORNER_RATIO = 0.18` (quiet, not capsule) |
| Pyramid gaps | `TIER_GAP_RATIO = 0.11` |
| Single-layer pyramid | compact centred tier (not full-bleed) |
| Pyramid `unit` | same green as passed status — `ChartTheme.STATUS_PASSED` / `#94ca66` |
| Bar charts | rounded tops (`Bars.fillTopRounded`) / suites pills |

## Palette SSOT

- Layers + passed status green: `stacks/java-spring/tests/allure/pyramid-layers.json`
- `unit.light` / `unit.dark` = `#94ca66` (Allure 3 passed)
- Guard: `python scripts/pyramid_palette_sync.py --check`

## Do not regress

1. Do **not** reintroduce a separate “accessible” green for `unit` that drifts from passed status (`#94ca66`).
2. Do **not** ship consumer configs without `base.darkMode: true` for Monitoring dogfood.
3. Pin consumers to monorepo `docs/allure-notifications/VERSION` (**6.0.12** CLI). Legacy jar: **5.0.8**.
4. Do **not** swap dogfood-full / README hero footer back to `testResultSeverities` + wide `successRate`.
5. Do **not** document **1024×1280**, **headerHeight 68**, or slot type **`pie`** as active 6.x canon — historical gate only (§ above).
