/**
 * Shared report types for collage analytics.
 */

export type Statistic = {
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
  unknown: number;
  total: number;
};

export type Summary = {
  statistic: Statistic;
  durationMs: number;
};

export type AllureLabel = {
  name: string;
  value: string;
};

export type AllureTestResult = {
  uuid?: string;
  name?: string;
  fullName?: string;
  status?: string;
  start?: number;
  stop?: number;
  labels: AllureLabel[];
};

export type SuiteStat = {
  name: string;
  count: number;
};

export type ReportAnalytics = {
  statistic: Statistic;
  layers: Record<string, number>;
  suites: SuiteStat[];
  durationsMs: number[];
  durationsMsByLayer: Record<string, number[]>;
  severities: Record<string, number>;
  hasLayerLabels: boolean;
  hasKnownLayerLabels: boolean;
  resultCount: number;
};
