import { applySuiteMeta } from "./declare-suite.js";
import type { SuiteMeta } from "./types.js";

interface PlaywrightTest {
  beforeEach(
    fn: (args: Record<string, unknown>) => void | Promise<void>,
  ): void;
}

/** Bind suite metadata to every test in a Playwright spec file. */
export function bindSuiteMeta(test: PlaywrightTest, meta: SuiteMeta): void {
  test.beforeEach(async () => {
    await applySuiteMeta(meta);
  });
}
