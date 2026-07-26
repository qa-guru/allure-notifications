# @allure-notifications/pyramid

Testing-pyramid **palette** + **rounded-tier geometry** SSOT for line **6.0.\***.

| Export | Role |
|--------|------|
| `CORNER_RATIO` / `TIER_GAP_RATIO` | Canon geometry (`0.18` / `0.11`) |
| `tierGapPx` / `tierCornerRadius` | Pure helpers mirroring Java `TestingPyramidPanel` |
| `LAYER_ORDER` / `PYRAMID_COLORS_*` / `STATUS_COLORS` | Palette; `unit` = pie `#94ca66` |
| `colorForLayer` | Theme-aware lookup |
| `./browser` | Browser-safe surface (same geometry + palette) for `apps/builder` |

Upstream palette SSOT: monorepo `stacks/java-spring/tests/allure/pyramid-layers.json`  
Guard: `python scripts/pyramid_palette_sync.py --check`

Builder: `apps/builder/scripts/sync-pyramid.mjs` → `vendor/allure-notifications-pyramid/` + import map (same pattern as `@config`).

Not shipped: `dashboard-overrides` / HTML inject (private zds stack).

```bash
pnpm --filter @allure-notifications/pyramid test
```
