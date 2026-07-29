import {
  epic,
  feature,
  label,
  layer,
  severity,
  story,
} from "allure-js-commons";

import { DEFAULT_EPIC } from "./defaults.js";
import type { SuiteMeta } from "./types.js";

/** Apply suite labels to the current Allure test (runtime API). */
export async function applySuiteMeta(meta: SuiteMeta): Promise<void> {
  await epic(meta.epic ?? DEFAULT_EPIC);
  await feature(meta.feature);
  await story(meta.story);
  await layer(meta.layer);
  await severity(meta.severity);
  if (meta.component) {
    await label("component", meta.component);
  }
}
