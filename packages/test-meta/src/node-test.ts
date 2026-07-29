import { beforeEach } from "node:test";

import { applySuiteMeta } from "./declare-suite.js";
import type { SuiteMeta } from "./types.js";

/**
 * Declare suite-level Allure labels once per test file (Java `@Epic` / `@Feature` model).
 * Requires `node --import allure-node-test/setup` (see scripts/node-test-allure.mjs).
 */
export function declareSuite(meta: SuiteMeta): void {
  beforeEach(() => applySuiteMeta(meta));
}
