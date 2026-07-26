# Canon — allure-notifications-builder

## Default — SQ-1080

| | |
|--|--|
| Canvas | **1080×1080** · grid **10×10** · cell **108×108** |
| Presets only | **870×1080** · **1080×1080** · **1410×1080** (no 1024×1280) |
| Panels | **17 catalog** (pie ↔ currentStatus · ChartType + groupBy/by) · mocks synced |
| Layout | **7-tile canon** — row1 pyramid·pie·durations · row2 coverage·success·problems · row3 stability by feature (see `DEFAULT_ITEMS`) |
| Palette defaults | pie/pyramid **3×3** · durations **4×3** · coverage/success **3×3** · problems **4×3** · stability by feature **4×5** (reset grid → **4×4**, ceiling 10 rows) · остальные **2×2** |
| Float / overlap | float **on** (exact x,y — no upward compact) · overlap off · min **1×1** |
| Legacy | CB-870 (pie 5×5 · pyramid 5×5 · durations 10×5 @ 870×1080) remains a preset + dogfood |

## Chrome knobs (Options → `base.chart.*`)

| Field | Default | Role |
|-------|---------|------|
| `headerHeight` | **22** | Card title-bar height (px). Jar **5.0.3+**. TG preview sets `--wt-bar-height` (+ proportional title/dots from DS baseline 28). |
| `cardGap` | **14** | Gap around/between cards (px). Jar **5.0.4+**. TG preview uses the same half-gap inset as `CollageRenderer.renderFree`. |
| `tilePad` | **6** | Inner body pad → `--wt-pad`. **Preview-only** — jar has no field yet; exported JSON keeps it for builder/preview parity. |

Reset → these three defaults + SQ-1080 `items`.

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
| durationsByLayer | durations | `groupBy: layer` · default SQ-1080 |
| durationDynamics | durationDynamics | |
| statusAgePyramid | statusAgePyramid | |

## Free export shape (jar)

Terminal exports full `config.json`. Chart block for jar free-grid (SQ-1080 default):

```json
{
  "mode": "collage",
  "layout": "free",
  "width": 1080,
  "height": 1080,
  "headerHeight": 22,
  "cardGap": 14,
  "tilePad": 6,
  "gridCols": 10,
  "gridRows": 10,
  "items": [
    {"type": "testingPyramid", "x": 0, "y": 0, "w": 3, "h": 3},
    {"type": "pie", "x": 3, "y": 0, "w": 3, "h": 3},
    {"type": "durations", "x": 6, "y": 0, "w": 4, "h": 3},
    {"type": "coverageDiff", "x": 0, "y": 3, "w": 3, "h": 3},
    {"type": "successRateDistribution", "x": 3, "y": 3, "w": 3, "h": 3},
    {"type": "problemsDistribution", "x": 6, "y": 3, "w": 4, "h": 3, "by": "environment"},
    {"type": "stabilityDistribution", "x": 6, "y": 6, "w": 4, "h": 4, "groupBy": "feature"}
  ],
  "pyramidFallback": "suites"
}
```

Telegram is **top-level** `telegram: { token, chat, topic, replyTo, templatePath }` (jar Config shape).


## Terminal bar (builder canon)

| | |
|--|--|
| `vector#` | Editable fingerprint in `.panel__bar-end` · localStorage key `allure-notifications-builder-vector-registry` · Enter restores · Esc cancels · miss → `aria-invalid` |
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
