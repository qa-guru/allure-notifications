# @qa-guru/allure-notifications-config

Shared **config.json** schema + builder catalog / canvas presets for line **6.0.\***.

| Export | Role |
|--------|------|
| `ConfigSchema` / `parseConfig` | zod validation (free layout + chrome knobs) |
| `PANEL_CATALOG` / `resolvePanelMeta` | 20 palette slots (17 analytics + 2 quality gates + tests table) |
| `chart.profile` | `"default"` \| `"kit"` — manual collage profile (default `"default"`) |
| Kit-only helpers | `shouldSilentSkipKitOnlyItem`, `KIT_ONLY_PANEL_IDS`, … — for core T6 dispatch |
| `./browser` | Same catalog/presets without zod (builder import map / vendor sync) |
| `DEFAULT_ITEMS` / `CANVAS_PRESETS` / `createDefaultConfig` | CB-870 default + 4-tile items + 870/1080/1410 presets |

Chrome defaults: `headerHeight` **31**, `cardGap` **14**, `tilePad` **6**.

### Deterministic suggestions (tier 0)

`suggestLayout(signals)` is pure and returns `{ profile, canvas: { w, h }, items }`.
`materializeLayout(ids, profile)` places caller-chosen catalog ids (e.g. an
LLM pick, tier 1) into the same canonical slots — ids never invent coordinates.
The `./suggest` entry exposes this API and `SUGGEST_TEMPLATES` without zod or I/O,
for future builder reuse. Callers validate the resulting config with `parseConfig`.

| Template | Canvas | Fixed slots | Selection |
|----------|--------|-------------|-----------|
| `default` | 870×1080 | 4 from `DEFAULT_ITEMS` | Up to 4 candidates; insufficient signals return exact `DEFAULT_ITEMS` |
| `trends` | 1080×1080 | First 6 CB-870 hero slots | 5–6 candidates |
| `hero` | 870×1080 | All 7 CB-870 hero slots | History + multiple known layers, without kit-only candidates |
| `detail` | 1410×1080 | All 7 CB-870 hero slots | Other dense / kit combinations |

Coordinates are locked to these templates. Matching panels keep their slots;
substitutions use vacant slots, without packing or overlap. Unused slots stay empty.
The hero geometry is pinned to `config/config.dogfood-telegram-full.json` in tests.

Primary selection order: `currentStatus`; history ≥2 runs → `durationDynamics` /
`statusDynamics`; ≥2 known layers → `testingPyramid` / `durationsByLayer`; the first
quality gate (Allure before Sonar); failures → kit `testsTable` with a payload,
otherwise `problemsDistribution`. A second gate and remaining history candidates
(`statusTransitions`, `successRateDistribution`, `testBaseGrowthDynamics`) use the
remaining capacity, capped at 7. Thus a crowded run can omit secondary panels.

QG rules / paths or failing tests with a tests-table payload select `kit`; otherwise
`default`. An explicit profile overrides this choice. Kit tiles are never selected
under `default`, and payloads are never fabricated. `send` still uses only the
explicit `chart.profile` in its input; it does not run the scorer.

```bash
ALLURE_RESULTS_DIR="$(mktemp -d)" pnpm --filter @qa-guru/allure-notifications-config test
```

Run workspace verification from the repository root with Node 26: `pnpm test` and
`pnpm typecheck`. Isolated package / `node --test` runs also need `ALLURE_RESULTS_DIR`
for the required Allure suite metadata; use a scratch directory to preserve prior results.

### `chart.profile` + quality gates (6.0+)

The `send` collage profile is a **manual** toggle — not inferred from `withKit` or kit package presence.

```json
{
  "base": {
    "chart": {
      "profile": "kit",
      "layout": "free",
      "width": 870,
      "height": 1080,
      "items": [
        { "id": "allureQualityGate", "type": "qualityGate", "x": 0, "y": 0, "w": 6, "h": 3 },
        { "id": "sonarQualityGate", "type": "qualityGate", "x": 6, "y": 0, "w": 6, "h": 3 }
      ]
    }
  }
}
```

- Omitted `profile` → `"default"` on parse.
- `type: "qualityGate"` + `id` `allureQualityGate` / `sonarQualityGate` — stable kit/Allure ids (palette add footprint 2×2; overview-like grid placement often 6×3 per gate).
- QG items are **valid in schema** under any profile; collage **warns and skips** kit-only kinds when `profile !== "kit"` (see `shouldSilentSkipKitOnlyItem` in `@qa-guru/allure-notifications-config`).
- Data paths (T6): `chart.allureQualityGatePath` (`KitQualityGateData` JSON) and `chart.sonarQualityGatePath` (Sonar `projectStatus` JSON → kit mapper). When `profile=kit` and a QG tile is present, missing data **fails** collage dry-run/live. AQG fallback without explicit path: `<allureFolder>/widgets/kit-panels/allureQualityGate.json`.

Builder SSOT: `apps/builder/` in this repository. The browser surface is synced to
`apps/builder/vendor/allure-notifications-config/` by `apps/builder/scripts/sync-config.mjs`.
The pure `./suggest` entry is available for a later builder increment; no UI wiring is included.
