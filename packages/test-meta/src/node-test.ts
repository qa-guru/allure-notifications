import {
  registerSuiteMeta,
  resolveDeclareSuiteCaller,
} from "./register-suite.js";
import type { SuiteMeta } from "./types.js";

/**
 * Declare suite-level Allure labels once per test file (Java `@Epic` / `@Feature` model).
 * Registers metadata in ALLURE_RESULTS_DIR/.suite-meta-registry.json for merge after run.
 */
export function declareSuite(meta: SuiteMeta): void {
  registerSuiteMeta(resolveDeclareSuiteCaller(new Error().stack), meta);
}
