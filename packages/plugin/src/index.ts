/**
 * @qa-guru/allure-notifications-plugin — Allure 3 plugin (Phase 5).
 *
 * Thin wrapper: parseConfig → loadReportAnalytics / renderCollagePng → CLI messengers.
 * Default export matches @allurereport/plugin-slack etalon for allurerc `import`.
 */

export {
  NotificationsPlugin as default,
  NotificationsPlugin,
  PACKAGE,
  PHASE,
  runNotificationsPlugin,
  type NotificationsPluginMode,
  type NotificationsPluginOptions,
  type NotificationsPluginResult,
} from "./plugin.js";
