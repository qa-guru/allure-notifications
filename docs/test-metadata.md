# Test metadata (Allure labels SSOT)

Explicit suite labels for the allure-notifications monorepo test run. Model mirrors Java class annotations (`@Epic`, `@Feature`, `@Story`, `@Layer`, `@Component`, `@Severity`).

## Package

`@qa-guru/allure-notifications-test-meta` — one `declareSuite()` per `node:test` file, `bindSuiteMeta()` per Playwright spec.

```typescript
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "cli-send",
  story: "Send path resolution",
  layer: "unit",
  component: "allure-notifications",
  severity: "critical",
});

describe("loadConfigFile", () => { /* … */ });
```

Default epic: **`@qa-guru/allure-notifications`** (`packages/test-meta/src/defaults.ts`).

## Taxonomy

| Label | Values / rule |
|-------|----------------|
| **epic** | `allure-notifications` (default) |
| **feature** | `config` · `pyramid` · `core-collage` · `cli-send` · `plugin-hook` · `builder-ui` · `test-meta` |
| **story** | Scenario / primary describe name for the file |
| **layer** | `unit` — `packages/*/test/*.test.ts` · `component` — `apps/builder/tests/*.test.ts` · `e2e` — `apps/builder/tests/*.spec.ts` |
| **component** | TMS stability component label — **required** for `layer=component\|e2e` (gate) |
| **severity** | `normal` (unit) · `critical` (cli) · `blocker` (builder e2e) |

**Do not confuse:** `layer=component` (pyramid tier) ≠ label `component` (TMS stability).

## Runner (Node 24)

Reporter-only `node:test` — no `allure-node-test/setup` preload:

```bash
node scripts/node-test-allure.mjs dist/test/*.test.js
# ≡ node --test --test-reporter=allure-node-test/reporter …
```

`declareSuite()` registers metadata at module load into `ALLURE_RESULTS_DIR/.suite-meta-registry.d/` (one shard per test file). After `pnpm test`, `scripts/merge-allure-suite-meta.mjs` merges labels into `*-result.json` before the gate.

Playwright specs keep `bindSuiteMeta()` + runtime `allure-js-commons` (allure-playwright on Node 24).

## Gate

After `pnpm test` (+ merge):

```bash
node scripts/check-allure-labels.mjs
```

Every `*-result.json` must include `epic`, `feature`, `story`, `layer`, `severity`; `component` when `layer` is `e2e` or `component`. Exit 1 on miss. Pipeline: `run-tests.mjs` → merge → gate.

## Deprecated

`scripts/enrich-allure-layers.mjs` — post-hoc layer inference removed from SSOT (`run-tests.mjs`, `ci-telegram.sh`). Layers only via `declareSuite` / `bindSuiteMeta`.

## Don't

- `@allure.label.epic=…` in test title strings
- `beforeEach` copy-paste in every `it()`
- Post-hoc enrich as primary metadata source
- `allure-node-test/setup` on Node 24 (requires Node ≥ 26.1)
