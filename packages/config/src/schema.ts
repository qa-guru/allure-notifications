/**
 * Zod schema for allure-notifications `config.json`.
 * Shape matches jar Config (base + messengers) with 5.0+ chart free-grid + chrome knobs.
 */

import { z } from "zod";

const LanguageSchema = z.enum([
  "en",
  "de",
  "fr",
  "ru",
  "by",
  "ua",
  "cn",
  "cnt",
  "morse",
]);

const LinksSchema = z
  .object({
    report: z.string().optional(),
    dashboard: z.string().optional(),
    testops: z.string().optional(),
    build: z.string().optional(),
  })
  .passthrough();

/** Free-grid cell — `{ type, x, y, w, h }` + optional catalog variants. */
export const ChartItemSchema = z
  .object({
    type: z.string().min(1),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
    by: z.string().min(1).optional(),
    groupBy: z.string().min(1).optional(),
  })
  .passthrough();

/**
 * `panels`: flat `string[]` (single row) or `string[][]` (rows) — jar PanelsDeserializer.
 */
export const PanelsSchema = z.union([
  z.array(z.string().min(1)),
  z.array(z.array(z.string().min(1))),
]);

export const ChartConfigSchema = z
  .object({
    mode: z.enum(["pie", "collage"]).optional(),
    layout: z.enum(["grid", "stacked", "row", "free"]).optional(),
    panels: PanelsSchema.optional(),
    items: z.array(ChartItemSchema).optional(),
    gridCols: z.number().int().positive().optional(),
    gridRows: z.number().int().positive().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    /** Card title-bar height (px). Builder SQ-1080 default 22; jar unset → renderer 68. */
    headerHeight: z.number().int().positive().optional().nullable(),
    /** Gap around/between cards (px). Default 14. */
    cardGap: z.number().int().nonnegative().optional().nullable(),
    /** Inner body pad (px) — preview/builder parity; jar parses, may ignore. */
    tilePad: z.number().int().nonnegative().optional().nullable(),
    pyramidFallback: z.string().optional(),
    historyPath: z.string().optional().nullable(),
    historyLimit: z.number().int().positive().optional().nullable(),
  })
  .passthrough()
  .superRefine((chart, ctx) => {
    if (chart.layout === "free") {
      if (!chart.items || chart.items.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'chart.layout "free" requires a non-empty chart.items array',
          path: ["items"],
        });
      }
    }
  });

export const BaseSchema = z
  .object({
    project: z.string().optional(),
    environment: z.string().optional(),
    comment: z.string().optional(),
    /** @deprecated use links.report */
    reportLink: z.string().optional(),
    links: LinksSchema.optional(),
    language: LanguageSchema.optional(),
    logo: z.string().optional(),
    allureFolder: z.string().optional(),
    allureResultsFolder: z.string().optional(),
    enableChart: z.boolean().optional(),
    chart: ChartConfigSchema.optional(),
    darkMode: z.boolean().optional(),
    enableSuitesPublishing: z.boolean().optional(),
    durationFormat: z.string().optional(),
    customData: z.record(z.string()).optional(),
  })
  .passthrough();

export const TelegramSchema = z
  .object({
    token: z.string().optional(),
    chat: z.string().optional(),
    topic: z.string().optional(),
    replyTo: z.string().optional(),
    templatePath: z.string().optional(),
  })
  .passthrough();

/** Loose messenger blocks — validated structurally in later phases. */
const LooseMessengerSchema = z.record(z.unknown()).optional();

/**
 * Root `config.json` schema.
 * Requires `base`. Telegram is the primary 6.0 messenger; others pass through.
 */
export const ConfigSchema = z
  .object({
    base: BaseSchema,
    telegram: TelegramSchema.optional(),
    slack: LooseMessengerSchema,
    mattermost: LooseMessengerSchema,
    mail: LooseMessengerSchema,
    discord: LooseMessengerSchema,
    loop: LooseMessengerSchema,
    rocketChat: LooseMessengerSchema,
    cliq: LooseMessengerSchema,
    teams: LooseMessengerSchema,
    proxy: LooseMessengerSchema,
  })
  .passthrough();

export type ChartItemInput = z.infer<typeof ChartItemSchema>;
export type ChartConfigInput = z.infer<typeof ChartConfigSchema>;
export type ConfigInput = z.infer<typeof ConfigSchema>;
export type Config = ConfigInput;

export function parseConfig(data: unknown): Config {
  return ConfigSchema.parse(data);
}

export function safeParseConfig(data: unknown) {
  return ConfigSchema.safeParse(data);
}

/** True when `data` is a valid config.json. */
export function isValidConfig(data: unknown): data is Config {
  return ConfigSchema.safeParse(data).success;
}
