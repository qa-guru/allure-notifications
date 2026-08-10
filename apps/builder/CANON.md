# Canon — allure-notifications-builder

## Default — CB-870

| | |
|--|--|
| Canvas | **870×1080** · grid **10×10** · cell **87×108** |
| Presets only | **870×1080** · **1080×1080** · **1410×1080** (no 1024×1280) |
| Panels | **17 catalog** (currentStatus · ChartType + groupBy/by) · mocks synced |
| Layout | **4-tile on 10×10** — pie 4×4 · durationDynamics 6×4 · pyramid 3×3 \| durations-by-layer 4×3 · empty cols 7–9 + rows 7–9 (`DEFAULT_ITEMS` only) |
| Palette add | always **2×2** footprint — caption = panel title; `defaultW/H` never mirror grid presets |
| Grid SSOT | `base.chart.items` from current vector · boot / Reset / `vector#default` → `applyDefaultVector()` |
| Float / overlap | float **on** (exact x,y — no upward compact) · overlap off · min **1×1** |
| Legacy dogfood | classic CB-870 (pie 5×5 · pyramid 5×5 · durations 10×5) remains in pixel-gate fixtures |
| Telegram / README showcase | **7-tile readme-hero** — `config/config.dogfood-telegram-full.json` (pie 5×4 · statusDynamics 5×4 · pyramid 4×3 · durations-by-layer 6×3 · successRate 3×3 · durationDynamics 4×3 · statusTransitions 3×3); not `DEFAULT_ITEMS` |

## Chrome knobs (Options → `base.chart.*`)

| Field | Default | Role |
|-------|---------|------|
| `headerHeight` | **31** | Card title-bar height (logical canvas px) = DS `--wt-bar-height`. Jar **5.0.3+**. TG/Preview: inline `--wt-bar-height` + title/dots from baseline 31. Editor `anb-panel__bar`: logical × displayScale (no floor). |
| `cardGap` | **14** | Gap around/between cards (logical canvas px) — equal edge & between. Jar **5.0.4+**. Editor: half-inset × displayScale; TG preview = `freeCellRect` then `transform: scale`. |
| `tilePad` | **6** | Inner body pad (logical canvas px) → `--wt-pad` × displayScale on editor; full logical on TG stage. Jar has no field yet. |

Reset / `vector#default` → default vector (`applyDefaultVector`) = these three defaults + CB-870 canvas + `DEFAULT_ITEMS`.

## 17 catalog

Palette slots ↔ `awesome-charts.mjs` / DS `WidgetTileMocks` (id unique; `type` = ChartType; variants via `groupBy` / `by`):

| id | type | notes |
|----|------|-------|
| currentStatus | currentStatus | |
| testingPyramid | testingPyramid | |
| testResultSeverities | testResultSeverities | |
| statusDynamics | statusDynamics | |
| statusTransitions | statusTransitions | |
| testBaseGrowthDynamics | testBaseGrowthDynamics | |
| coverageDiff | coverageDiff | |
| successRateDistribution | successRateDistribution | |
| problemsDistribution | problemsDistribution | `by: environment` |
| stabilityByComponent | stabilityDistribution | `groupBy: label-name:component` |
| stabilityByFeature | stabilityDistribution | `groupBy: feature` |
| stabilityByEpic | stabilityDistribution | `groupBy: epic` |
| stabilityByStory | stabilityDistribution | `groupBy: story` |
| durations | durations | |
| durationsByLayer | durations | `groupBy: layer` · default compact-hero |
| durationDynamics | durationDynamics | |
| statusAgePyramid | statusAgePyramid | |

## Free export shape (jar)

Terminal exports full `config.json`. Chart block for jar free-grid (CB-870 default):

```json
{
  "mode": "collage",
  "layout": "free",
  "width": 870,
  "height": 1080,
  "headerHeight": 31,
  "cardGap": 14,
  "tilePad": 6,
  "gridCols": 10,
  "gridRows": 10,
  "items": [
    {"type": "currentStatus", "x": 0, "y": 0, "w": 4, "h": 4},
    {"type": "durationDynamics", "x": 4, "y": 0, "w": 6, "h": 4},
    {"type": "testingPyramid", "x": 0, "y": 4, "w": 3, "h": 3},
    {"type": "durations", "x": 3, "y": 4, "w": 4, "h": 3, "groupBy": "layer"}
  ],
  "pyramidFallback": "suites"
}
```

Telegram is **top-level** `telegram: { token, chat, topic, replyTo, templatePath }` (jar Config shape).


## Header tools (do not regress)

| Slot | Link | Icon |
|------|------|------|
| GitHub | `github.com/qa-guru/allure-notifications` | template SVG |
| Site | `allure-notifications.qa.guru` | template **github.io** SVG — **no** `iconSrc`, **no** `allure3-logo` |

Smoke: `header tool links` — site has `.icon svg`, zero `.icon img`.

## Resize L-brackets (editor chrome)

NE/NW/SE/SW parked at the **cell edge** (`top/bottom/left/right: 0`). The visible crop-mark (`::after`) is sized to `--anb-resize-mark ≈ half-gap − 1px` so the stroke stays in the cardGap gutter **outside** the rounded card — never under the title bar (`half-gap + bar-h`) and never digging into the chart. **Editor** `--anb-card-radius`: `round(logical × displayScale)` clamp **`[5, 10]px`** (logical = `round(12 × min(W,H)/1080)` clamp `[8,12]`). Pre-regression editor used **10px**. **TG export popover** + **collage PNG** use logical radius only (no displayScale). Guard: smoke `resize L-brackets sit in gutter outside card`.

## Editor ↔ TG preview proportions

Logical `cardGap` / `headerHeight` / `tilePad` are jar canvas px. TG stage draws at full logical size then `transform: scale`. Editor must multiply the same values by `displayW / chart.width` into `--anb-card-gap` / `--anb-bar-h` / `--wt-pad` (and GridStack cellHeight inset) — never raw logical px as CSS px. Chart mocks share `tierForSpan(10, w, h)`. Editor header stays `anb-panel__bar` (title + copy/delete); product dots only on TG/export.

## Quality-gate chrome (LOCKED — do not regress)

**Accepted visual (2026-08-10):** one hybrid bar + body. Editor 2×2 shows full titles `Allure QG` / `Sonar QG`, SQG compact `cov|72<80` + `bugs|3>0`, bar height = `--anb-bar-h` (display-scaled). Debug: [`debug-qg.html`](./debug-qg.html). Guard: smoke `chart.profile kit` QG chrome asserts.

| Surface | Chrome | Forbidden |
|---------|--------|-----------|
| Jar collage PNG | Hybrid PNG full cell | macOS `drawCard` header / dots |
| Editor canvas | Hybrid full-bleed; delete overlay | `anb-panel__bar`; nested second bar; raw `31px` bar on scaled canvas; `font-size: 0.46rem` crush on QG |
| TG / export preview | Hybrid only | outer `widget-tile__bar` |

Palette thumbs: micro `widget-tile__bar` + body-only QG (unchanged).

Do **not** reintroduce body-only editor QG under `anb-panel__bar` (looks like empty/blue inset). Do **not** put full DS message/formula SQG into 2×2 without compact rules + `min-width: 0` overrides (DS `6.5rem` floors).

## Terminal bar (builder canon)

| | |
|--|--|
| `vector#` | Editable fingerprint in `.panel__bar-end` · localStorage key `anb-apps-builder-vector-registry` · Enter restores · Esc cancels · miss → `aria-invalid` · alias **`vector#default`** = code SSOT (CB-870 layout) |
| Actions | Icon-only **Reset → Download → Copy** (`.icon-btn.panel__action`, SVG 16×16 stroke 1.5) |
| JSON | Top-level `vector: "vector#…"` metadata; hash payload is `{base, telegram}` without `vector` |
| Body | Direct `.panel__code.ch-code` (no `__body` pad) · **always** `mountHighlightedOutput` / VS Code Dark+ · no blank rows before `{` / after `}` |

Same pattern: selenoid Capabilities · react-ui configurator demo · autotests-builder (hash badge). RAG `cfg-terminal-highlight`.

## vs collage-builder

| | **allure-notifications-builder** | collage-builder (legacy) |
|--|--|--|
| Scope | Full `config.json` (base · links · messengers · chart) | Chart collage only |
| Stand | **:3011** | :3010 |
| Classes | `anb-*` | `cb-*` |
| Status | **primary configurator** | do not extend |
