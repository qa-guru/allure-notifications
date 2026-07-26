/**
 * Panel render context.
 */

import type { Config } from "@allure-notifications/config";

import type { ReportAnalytics } from "../report/types.js";
import type { ChartTheme } from "../theme.js";

export type PanelContext = {
  config: Config;
  theme: ChartTheme;
  width: number;
  height: number;
  analytics: ReportAnalytics;
  showTitle: boolean;
  groupBy?: string;
  by?: string;
};

export function panelContext(
  config: Config,
  theme: ChartTheme,
  width: number,
  height: number,
  analytics: ReportAnalytics,
  opts: { showTitle?: boolean; groupBy?: string; by?: string } = {},
): PanelContext {
  return {
    config,
    theme,
    width,
    height,
    analytics,
    showTitle: opts.showTitle ?? false,
    groupBy: opts.groupBy,
    by: opts.by,
  };
}
