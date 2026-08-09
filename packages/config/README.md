# @qa-guru/allure-notifications-config

Shared **config.json** schema + builder catalog / canvas presets for line **6.0.\***.

| Export | Role |
|--------|------|
| `ConfigSchema` / `parseConfig` | zod validation (free layout + chrome knobs) |
| `PANEL_CATALOG` / `resolvePanelMeta` | 19 palette slots (17 analytics + 2 quality gates) |
| `chart.profile` | `"default"` \| `"kit"` — manual collage profile (default `"default"`) |
| Kit-only helpers | `shouldSilentSkipKitOnlyItem`, `KIT_ONLY_PANEL_IDS`, … — for core T6 dispatch |
| `./browser` | Same catalog/presets without zod (builder import map / vendor sync) |
| `DEFAULT_ITEMS` / `CANVAS_PRESETS` / `createDefaultConfig` | CB-870 default + 4-tile items + 870/1080/1410 presets |

Chrome defaults (builder SQ-1080): `headerHeight` **22**, `cardGap` **14**, `tilePad` **6**.

```bash
pnpm --filter @qa-guru/allure-notifications-config test
```

### `chart.profile` + quality gates (6.0+)

Collage profile is a **manual** toggle — not inferred from `withKit` or kit package presence.

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
- QG items are **valid in schema** under any profile; collage **silent-skips** kit-only kinds when `profile !== "kit"` (see `shouldSilentSkipKitOnlyItem` in `@qa-guru/allure-notifications-config`).
- Data paths (T6): `chart.allureQualityGatePath` (`KitQualityGateData` JSON) and `chart.sonarProjectStatusPath` (Sonar `projectStatus` JSON → kit mapper). When `profile=kit` and a QG tile is present, missing data **fails** collage dry-run/live. AQG fallback without explicit path: `<allureFolder>/widgets/kit-panels/allureQualityGate.json`.

Source extracted from hub builder `allure-notifications-builder/js/app.js` (Phase 0 — builder not yet merged to `apps/builder/`). Phase 4 wires builder imports.
