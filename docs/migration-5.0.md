# Migration guide: 4.x → 5.0

This guide covers configuration and report layout changes introduced in **allure-notifications 5.0.0**.

For a ready-to-use CI example see [ci-cookbook-5.0.md](ci-cookbook-5.0.md) and [config/config-5.0-collage.example.json](../config/config-5.0-collage.example.json).

## Quick checklist

| 4.x | 5.0 | Action |
|-----|-----|--------|
| `base.reportLink` | `base.links.report` | Migrate; `reportLink` still works but is deprecated |
| `enableChart: true` | same + optional `chart.mode` | No change required — default stays `pie` (4.x behaviour) |
| — | `chart.mode: "collage"` | Opt in for the new 1000×600 PNG collage |
| — | `base.links` | Add dashboard / testops / build links (optional) |
| — | `base.allureResultsFolder` | Set when pyramid / durations need raw `*-result.json` |
| `widgets/summary.json` only | Allure 2 **or** Allure 3 | Library auto-detects report version |

## Links: `reportLink` → `links.report`

### Before (4.x)

```json
{
  "base": {
    "reportLink": "${ALLURE_REPORT_URL}"
  }
}
```

### After (5.0)

```json
{
  "base": {
    "links": {
      "report": "${ALLURE_REPORT_URL}",
      "dashboard": "${ALLURE_DASHBOARD_URL}",
      "testops": "${ALLURE_JOB_RUN_URL}",
      "build": "${BUILD_URL}"
    }
  }
}
```

**Behaviour**

- `links.report` is the canonical field. Templates render all non-empty links (report, dashboard, testops, build) with i18n labels.
- Deprecated `reportLink` is still read: if `links.report` is empty, `reportLink` is used as fallback.
- Legacy templates that reference `${reportLink}` keep working — the value is populated from `links.report` when present.

**System property overrides**

```shell
-Dnotifications.base.links.report=${ALLURE_REPORT_URL}
-Dnotifications.base.links.dashboard=${ALLURE_DASHBOARD_URL}
-Dnotifications.base.links.testops=${ALLURE_JOB_RUN_URL}
-Dnotifications.base.links.build=${BUILD_URL}
# deprecated, still supported:
-Dnotifications.base.reportLink=${ALLURE_REPORT_URL}
```

## Charts: `enableChart` + `chart.mode`

`enableChart` remains the master switch. When `false`, no chart image is attached.

When `enableChart` is `true`, rendering mode is controlled by `base.chart.mode`:

| `chart.mode` | Image | 4.x compatible |
|--------------|-------|----------------|
| `pie` (default) | Single status pie chart | Yes |
| `collage` | 1000×600 PNG with three panels | New in 5.0 |

### Pie mode (default — no config change needed)

```json
{
  "base": {
    "enableChart": true,
    "darkMode": false
  }
}
```

Omitting `chart` entirely keeps 4.x pie chart behaviour.

### Collage mode (5.0)

```json
{
  "base": {
    "enableChart": true,
    "darkMode": true,
    "allureResultsFolder": "build/allure-results/",
    "chart": {
      "mode": "collage",
      "panels": ["pie", "testingPyramid", "durations"],
      "pyramidFallback": "suites",
      "width": 1000,
      "height": 600
    }
  }
}
```

**Collage layout** (default `grid` since 5.0.1; `free` since **5.0.2**):

```
┌─────────────┬──────────────────┐
│  pie        │ testing pyramid  │
│  (status)   │ or suites bar    │
├─────────────┴──────────────────┤
│  durations (histogram)         │
└────────────────────────────────┘
```

- **Top-left** — passed / failed / broken / skipped / unknown pie (same colours as 4.x).
- **Top-right** — testing pyramid when `layer` labels exist in `allure-results`; otherwise horizontal suites bar (`pyramidFallback`, default `suites`).
- **Bottom** — per-test duration distribution from `*-result.json`.

`chart.layout` selects the placement engine:

| `layout` | Placement | Notes |
|----------|-----------|-------|
| `grid` (default) | 2×2 from `panels` rows | Equal columns per row (lossy vs editor) |
| `stacked` / `row` | Full-width stack / single row | Legacy |
| `free` (**5.0.2**) | `items: [{type,x,y,w,h}]` on `gridCols`×`gridRows` | CB-870 lossless (e.g. 870×1080, 10×10) |


### 5.0.3 chart polish

- Pyramid: quieter corner radius, tighter tier gaps, single-layer stays compact (not full-bleed).
- Pyramid `unit` layer reuses Allure 3 pie success (`ChartTheme.STATUS_PASSED` / `#94ca66`).
- Durations / success-rate / suites bars: rounded tops (or pills).

Example free (CB-870 default):

```json
{
  "layout": "free",
  "width": 870,
  "height": 1080,
  "gridCols": 10,
  "gridRows": 10,
  "items": [
    {"type": "pie", "x": 0, "y": 0, "w": 5, "h": 5},
    {"type": "testingPyramid", "x": 5, "y": 0, "w": 5, "h": 5},
    {"type": "durations", "x": 0, "y": 5, "w": 10, "h": 5}
  ]
}
```

### `chart` fields

| Field | Default | Description |
|-------|---------|-------------|
| `mode` | `pie` | `pie` or `collage` |
| `layout` | `grid` | `grid` \| `stacked` \| `row` \| `free` (5.0.2) |
| `panels` | `["pie","testingPyramid","durations"]` | Panel order for `grid`/`stacked`/`row` |
| `items` | — | Free-grid cells `{type,x,y,w,h}` (required when `layout: free`) |
| `gridCols` / `gridRows` | `10` / `10` | Free-grid substrate |
| `pyramidFallback` | `suites` | Panel shown when no `layer` labels in results (`suites` = top suites bar) |
| `width` | `1000` | Collage PNG width (pixels) |
| `height` | `600` | Collage PNG height (pixels) |
| `headerHeight` | `68` | Card title-bar height (px); null → canon 68 |
| `cardGap` | `14` | Gap around/between cards (px); null → canon 14 (**5.0.4**) |

**System property overrides**

```shell
-Dnotifications.base.chart.mode=collage
-Dnotifications.base.chart.width=1000
-Dnotifications.base.chart.height=600
-Dnotifications.base.chart.pyramidFallback=suites
```

## `allureResultsFolder`

Required for collage analytics (pyramid, suites fallback, durations). Optional for pie-only mode.

Resolution order:

1. Explicit `base.allureResultsFolder` if set.
2. Sibling `allure-results/` next to `allureFolder` (e.g. `build/allure-results` beside `build/allure-report`).
3. Nested `<allureFolder>/allure-results/` if present.

```json
{
  "base": {
    "allureFolder": "build/allure-report/",
    "allureResultsFolder": "build/allure-results/"
  }
}
```

**Testing pyramid** needs `layer` labels on test results (e.g. `@Layer("unit")` / Allure label `layer`). Without labels — or with only non-SSOT labels such as `UI Tests` / `visual` — `pyramidFallback: "suites"` shows a horizontal bar chart of top suites. Known SSOT layers plus unknown labels render an extra gray **`other`** band at the top of the pyramid.

## Suites publishing (`enableSuitesPublishing`)

| Report | Source |
|--------|--------|
| Allure 2 | `widgets/suites.json` when present |
| Allure 3 / missing widgets | Built from `*-result.json` via `base.allureResultsFolder` (or sibling `allure-results/`) |

If neither widgets nor results are available, a warning is logged and the suites block is omitted from the message.

## Allure 2 vs Allure 3

`ReportLocator` detects the report version automatically:

| Version | Summary path | Detection |
|---------|--------------|-----------|
| Allure 2 | `<allureFolder>/widgets/summary.json` | `statistic` key |
| Allure 3 | `<allureFolder>/summary.json` | `stats` key |

If neither path exists at the top level, the library searches recursively (depth 5) for `summary.json`.

**Allure 3 adaptation:** `stats` → legacy `statistic`, root `duration` → `time.duration`. Pie chart and notification text work without config changes.

**Dashboard** (for `links.dashboard` auto-resolve is separate): nested `<report>/dashboard/` or sibling `../allure-dashboard/`.

### Allure 3 CI workaround (pre-5.0 consumers)

Some pipelines copy A3 `summary.json` to `widgets/summary.json` for tools that only read the Allure 2 path. With 5.0 this copy is **not required** — point `allureFolder` at the report root.

## Minimal migration paths

### Stay on 4.x behaviour

No `config.json` changes. Upgrade jar to 5.0.0.

### Add multi-link notifications

```diff
  "base": {
-   "reportLink": "${ALLURE_REPORT_URL}",
+   "links": {
+     "report": "${ALLURE_REPORT_URL}",
+     "build": "${BUILD_URL}"
+   },
```

### Enable collage chart

```diff
  "base": {
    "enableChart": true,
+   "allureResultsFolder": "build/allure-results/",
+   "chart": { "mode": "collage" },
```

## Breaking changes

None for existing 4.x configs using pie chart and `reportLink`. Deprecated fields remain supported in 5.0.0.

## See also

- [README.md](../README.md) — usage and messenger settings
- [ci-cookbook-5.0.md](ci-cookbook-5.0.md) — GitHub Actions / Jenkins examples
