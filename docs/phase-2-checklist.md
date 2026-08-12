# Phase 2 checklist — kit collage palette (removed `packages/pyramid`)

Palette + geometry now live in `@qa-guru/allure-report-kit` (`/collage` export).

```bash
# from zero-design-system monorepo root
python scripts/pyramid_palette_sync.py --check

# from nested kit
cd projects/allure-report-kit-home/allure-report-kit
npm test -- test/collage-palette.test.mjs
```
