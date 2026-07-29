/**
 * Canvas presets + DEFAULT_ITEMS (4-tile compact-hero) + chrome knobs.
 * Extracted from allure-notifications-builder `js/app.js` / CANON.md.
 */
/** Presets only — 870×1080 · 1080×1080 · 1410×1080 (no 1024×1280). */
export const CANVAS_PRESETS = Object.freeze({
    "870x1080": { w: 870, h: 1080 },
    "1080x1080": { w: 1080, h: 1080 },
    "1410x1080": { w: 1410, h: 1080 },
});
/** Default canvas — CB-870 (Telegram post). */
export const DEFAULT_CANVAS = "870x1080";
export const GRID_COLS = 10;
export const GRID_ROWS = 10;
/** Jar / collage chrome defaults (CollageRenderer + widget-tile canon in builder). */
export const DEFAULT_HEADER_HEIGHT = 22;
export const DEFAULT_CARD_GAP = 14;
/** Preview-only — maps to `--wt-pad`; jar parses but does not apply yet. */
export const DEFAULT_TILE_PAD = 6;
/**
 * Default layout — 4-tile packed on full 10×10 (Allure dashboard gutters).
 * pie 4×5 · durationDynamics 6×5 · pyramid 4×5 | durations-by-layer 6×5.
 * See builder CANON.md.
 */
export const DEFAULT_ITEMS = Object.freeze([
    { type: "pie", x: 0, y: 0, w: 4, h: 5 },
    { type: "durationDynamics", x: 4, y: 0, w: 6, h: 5 },
    { type: "testingPyramid", x: 0, y: 5, w: 4, h: 5 },
    { type: "durations", x: 4, y: 5, w: 6, h: 5, groupBy: "layer" },
]);
/**
 * Builder-shaped default `config.json` (CB-870 free + chrome knobs).
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
/** SQ-1080 helper — same DEFAULT_ITEMS on 1080×1080. */
export function createSq1080Config(opts = {}) {
    return createDefaultConfig({ ...opts, canvas: "1080x1080" });
}
