# allure-notifications collage canon (locked)

**Jar pin:** [`../VERSION`](../VERSION) → **5.0.3**  
**Release:** [v5.0.3](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.3)

## Visual lock (Telegram CB-870 free post)

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
3. Pin consumers to `docs/allure-notifications/VERSION` (currently 5.0.3).
