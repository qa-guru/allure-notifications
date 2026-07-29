/** Pyramid tier — maps to Allure TestOps Test Layer via `layer` label. */
export type TestLayer =
  | "unit"
  | "component"
  | "integration"
  | "api"
  | "e2e"
  | "manual";

/** Allure severity label values. */
export type Severity =
  | "blocker"
  | "critical"
  | "normal"
  | "minor"
  | "trivial";

/** Suite-level metadata (Java class annotations model). */
export interface SuiteMeta {
  /** Defaults to {@link DEFAULT_EPIC}. */
  epic?: string;
  feature: string;
  story: string;
  layer: TestLayer;
  /** TMS stability component label — required for `e2e` and `component` layers. */
  component?: string;
  severity: Severity;
}
