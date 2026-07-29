# Canon — allure-notifications-builder

## Default — CB-870

| | |
|--|--|
| Canvas | **870×1080** · grid **10×10** · cell **87×108** |
| Presets only | **870×1080** · **1080×1080** · **1410×1080** (no 1024×1280) |
| Panels | **17 catalog** (pie ↔ currentStatus · ChartType + groupBy/by) · mocks synced |
| Layout | **4-tile on 10×10** — pie 4×4 · durationDynamics 6×4 · pyramid 3×3 \| durations-by-layer 4×3 · empty cols 7–9 + rows 7–9 (`DEFAULT_ITEMS` only) |
| Palette add | always **2×2** footprint — caption = panel title; `defaultW/H` never mirror grid presets |
| Grid SSOT | `base.chart.items` from current vector · boot / Reset / `vector#default` → `applyDefaultVector()` |
| Float / overlap | float **on** (exact x,y — no upward compact) · overlap off · min **1×1** |
| Legacy dogfood | classic CB-870 (pie 5×5 · pyramid 5×5 · durations 10×5) remains in dogfood fixtures |

## Chrome knobs (Options → `base.chart.*`)

| Field | Default | Role |
|-------|---------|------|
| `headerHeight` | **22** | Card title-bar height (px). Jar **5.0.3+**. TG preview sets `--wt-bar-height` (+ proportional title/dots from DS baseline 28). |
| `cardGap` | **14** | Gap around/between cards (px) — equal edge & between (Allure / `widget-mosaic--post`). Jar **5.0.4+**. Editor: grid half-inset + content half-inset; TG preview = `CollageRenderer.renderFree`. |
| `tilePad` | **6** | Inner body pad → `--wt-pad`. **Preview-only** — jar has no field yet; exported JSON keeps it for builder/preview parity. |

Reset / `vector#default` → default vector (`applyDefaultVector`) = these three defaults + CB-870 canvas + `DEFAULT_ITEMS`.

## 17 catalog

Palette slots ↔ `awesome-charts.mjs` / DS `WidgetTileMocks` (id unique; `type` = ChartType; variants via `groupBy` / `by`):

| id | type | notes |
|----|------|-------|
| pie | pie | ↔ currentStatus |
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
  "headerHeight": 22,
  "cardGap": 14,
  "tilePad": 6,
  "gridCols": 10,
  "gridRows": 10,
  "items": [
    {"type": "pie", "x": 0, "y": 0, "w": 4, "h": 5},
    {"type": "durationDynamics", "x": 4, "y": 0, "w": 6, "h": 5},
    {"type": "testingPyramid", "x": 0, "y": 5, "w": 4, "h": 5},
    {"type": "durations", "x": 4, "y": 5, "w": 6, "h": 5, "groupBy": "layer"}
  ],
  "pyramidFallback": "suites"
}
```

Telegram is **top-level** `telegram: { token, chat, topic, replyTo, templatePath }` (jar Config shape).


## Terminal bar (builder canon)

| | |
|--|--|
| `vector#` | Editable fingerprint in `.panel__bar-end` · localStorage key `allure-notifications-builder-vector-registry` · Enter restores · Esc cancels · miss → `aria-invalid` · alias **`vector#default`** = code SSOT (CB-870 layout) |
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
