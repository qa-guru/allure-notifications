# Phase 2 checklist — packages/pyramid

| # | Item | Done |
|---|------|------|
| 1 | Palette SSOT (`LAYER_ORDER`, light/dark, `STATUS_COLORS`) | [x] |
| 2 | `unit` = pie passed `#94ca66` both themes | [x] |
| 3 | Geometry SSOT `CORNER_RATIO=0.18`, `TIER_GAP_RATIO=0.11` + helpers | [x] |
| 4 | Unit tests vs `stacks/java-spring/tests/allure/pyramid-layers.json` | [x] |
| 5 | `python scripts/pyramid_palette_sync.py --check` green | [x] |
| 6 | Wire `core` / builder imports | [ ] Phase 3–4 |

```bash
cd projects/allure-notifications-home/allure-notifications
pnpm install
pnpm --filter @qa-guru/allure-notifications-pyramid test
# from monorepo root:
python scripts/pyramid_palette_sync.py --check
```
