/**
 * Canvas presets + SQ-1080 DEFAULT_ITEMS + chrome knobs.
 * Extracted from allure-notifications-builder `js/app.js` / CANON.md.
 */
/** Presets only — 870×1080 · 1080×1080 · 1410×1080 (no 1024×1280). */
export const CANVAS_PRESETS = Object.freeze({
    "870x1080": { w: 870, h: 1080 },
    "1080x1080": { w: 1080, h: 1080 },
    "1410x1080": { w: 1410, h: 1080 },
});
export const DEFAULT_CANVAS = "1080x1080";
export const GRID_COLS = 10;
export const GRID_ROWS = 10;
/** Jar / SQ-1080 chrome defaults (CollageRenderer + widget-tile canon in builder). */
export const DEFAULT_HEADER_HEIGHT = 22;
export const DEFAULT_CARD_GAP = 14;
/** Preview-only — maps to `--wt-pad`; jar parses but does not apply yet. */
export const DEFAULT_TILE_PAD = 6;
/**
 * SQ-1080 canon — 7 tiles, 3 rows (3+3+4 cols).
 * See builder CANON.md / `DEFAULT_ITEMS` in `js/app.js`.
 */
export const DEFAULT_ITEMS = Object.freeze([
    { type: "testingPyramid", x: 0, y: 0, w: 3, h: 3 },
    { type: "pie", x: 3, y: 0, w: 3, h: 3 },
    { type: "durations", x: 6, y: 0, w: 4, h: 3 },
    { type: "coverageDiff", x: 0, y: 3, w: 3, h: 3 },
    { type: "successRateDistribution", x: 3, y: 3, w: 3, h: 3 },
    { type: "problemsDistribution", x: 6, y: 3, w: 4, h: 3, by: "environment" },
    { type: "stabilityDistribution", x: 6, y: 6, w: 4, h: 4, groupBy: "feature" },
]);
/**
 * Builder-shaped default `config.json` (SQ-1080 free + chrome knobs).
 * Matches `createDefaultState()` export from the builder (minus UI-only `vector`).
 */
export function createDefaultConfig(opts = {}) {
    const canvasKey = opts.canvas ?? DEFAULT_CANVAS;
    const canvas = CANVAS_PRESETS[canvasKey];
    if (!canvas) {
        throw new Error(`Unknown canvas preset: ${String(canvasKey)}`);
    }
    return {
        base: {
            project: opts.project ?? "",
            environment: opts.environment ?? "",
            comment: opts.comment ?? "",
            language: opts.language ?? "en",
            allureFolder: opts.allureFolder ?? "allure-report/",
            allureResultsFolder: opts.allureResultsFolder ?? "allure-results/",
            enableChart: true,
            darkMode: true,
            chart: {
                mode: "collage",
                layout: "free",
                width: canvas.w,
                height: canvas.h,
                headerHeight: DEFAULT_HEADER_HEIGHT,
                cardGap: DEFAULT_CARD_GAP,
                tilePad: DEFAULT_TILE_PAD,
                gridCols: GRID_COLS,
                gridRows: GRID_ROWS,
                items: DEFAULT_ITEMS.map((p) => ({ ...p })),
                pyramidFallback: "suites",
            },
            links: {
                report: "",
                dashboard: "",
                testops: "",
                build: "",
            },
        },
        telegram: {
            token: opts.telegram?.token ?? "",
            chat: opts.telegram?.chat ?? "",
            topic: opts.telegram?.topic ?? "",
            replyTo: opts.telegram?.replyTo ?? "",
            templatePath: opts.telegram?.templatePath ?? "/templates/telegram.ftl",
        },
    };
}
/** Alias — SQ-1080 is the default canvas. */
export const createSq1080Config = createDefaultConfig;
