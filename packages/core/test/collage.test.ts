import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createCanvas, loadImage } from "@napi-rs/canvas";
import {
  DEFAULT_ITEMS,
  PANEL_CATALOG,
  createSq1080Config,
  parseConfig,
  resolvePanelMeta,
  type ChartItem,
} from "@allure-notifications/config";
import {
  CORNER_RATIO,
  STATUS_COLORS,
  TIER_GAP_RATIO,
} from "@allure-notifications/pyramid";

import {
  DEFAULT_EMPTY_MESSAGE,
  PNG_BACKEND,
  PYRAMID_GEOMETRY,
  buildAnalytics,
  readAllureResults,
  readSummary,
  renderCollagePng,
  renderEmptyPanel,
  resolveCardTitle,
  themeFromDarkMode,
} from "../src/index.js";
import { panelContext } from "../src/collage/context.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

const CANON_PNG = "collage-cb870-free-dogfood-5.0.3.png";

/** Visual gate thresholds vs Java CB-870 free dogfood (fonts may differ). */
const GATE = {
  sampleW: 128,
  sampleH: 160,
  rgbTol: 28,
  fullFloor: 0.9,
  aHashSize: 16,
  aHashMaxHamming: 40,
  regionSampleW: 64,
  regionSampleH: 80,
  regionTol: 30,
  regionFloor: 0.85,
  unitGreenMin: 500,
  outerBgMin: 100,
} as const;

/** Walk up to monorepo `docs/allure-notifications/canon/` (absent outside zds). */
function findCanonDir(): string | null {
  let dir = __dirname;
  for (let i = 0; i < 14; i++) {
    const candidate = join(dir, "docs/allure-notifications/canon");
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = join(dir, "..");
  }
  return null;
}

function findCanonPng(): string | null {
  const dir = findCanonDir();
  if (!dir) return null;
  const png = join(dir, CANON_PNG);
  return existsSync(png) ? png : null;
}

/** Card rects matching `renderCollagePng` free-grid (floor cells + half-gap). */
function freeCardRect(
  collageW: number,
  collageH: number,
  cols: number,
  rows: number,
  cardGap: number,
  item: { x: number; y: number; w: number; h: number },
): { left: number; top: number; width: number; height: number } {
  const half = Math.floor(cardGap / 2);
  const cellW = Math.floor(collageW / cols);
  const cellH = Math.floor(collageH / rows);
  let { x, y, w, h } = item;
  if (x + w > cols) w = cols - x;
  if (y + h > rows) h = rows - y;
  const rawLeft = x * cellW;
  const rawTop = y * cellH;
  const rawRight = (x + w) * cellW;
  const rawBottom = (y + h) * cellH;
  const left = x === 0 ? cardGap : rawLeft + half;
  const top = y === 0 ? cardGap : rawTop + half;
  const right = x + w === cols ? collageW - cardGap : rawRight - half;
  const bottom = y + h === rows ? collageH - cardGap : rawBottom - half;
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function cb870Config(opts: {
  width: number;
  height: number;
  allureFolder: string;
  allureResultsFolder: string;
}) {
  return parseConfig({
    base: {
      project: "CB-870-grid free dogfood",
      environment: "test",
      language: "en",
      allureFolder: opts.allureFolder,
      allureResultsFolder: opts.allureResultsFolder,
      enableChart: true,
      darkMode: true,
      chart: {
        mode: "collage",
        layout: "free",
        width: opts.width,
        height: opts.height,
        headerHeight: 68,
        cardGap: 14,
        gridCols: 10,
        gridRows: 10,
        items: [
          { type: "pie", x: 0, y: 0, w: 5, h: 5 },
          { type: "testingPyramid", x: 5, y: 0, w: 5, h: 5 },
          { type: "durations", x: 0, y: 5, w: 10, h: 5 },
        ],
        pyramidFallback: "suites",
      },
    },
  });
}

async function pngSize(png: Buffer): Promise<{ w: number; h: number }> {
  const img = await loadImage(png);
  return { w: img.width, h: img.height };
}

async function countNearColor(
  png: Buffer,
  target: { r: number; g: number; b: number },
  tol = 8,
  step = 2,
): Promise<number> {
  const img = await loadImage(png);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  let count = 0;
  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const i = (y * img.width + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (
        Math.abs(r - target.r) <= tol &&
        Math.abs(g - target.g) <= tol &&
        Math.abs(b - target.b) <= tol
      ) {
        count++;
      }
    }
  }
  return count;
}

/** Average hash (ahash) — structural compare vs Java canon (fonts may differ). */
async function aHash(png: Buffer, size = 16): Promise<bigint> {
  const img = await loadImage(png);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const grays: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    grays.push(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
  }
  const mean = grays.reduce((a, b) => a + b, 0) / grays.length;
  let bits = 0n;
  for (let i = 0; i < grays.length; i++) {
    if (grays[i]! >= mean) {
      bits |= 1n << BigInt(i);
    }
  }
  return bits;
}

function hamming(a: bigint, b: bigint): number {
  let x = a ^ b;
  let n = 0;
  while (x > 0n) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

/**
 * Downscale both images and count near-matching pixels.
 * Captures layout/palette parity without requiring font identity.
 */
async function pixelMatchRatio(
  a: Buffer,
  b: Buffer,
  tw = GATE.sampleW,
  th = GATE.sampleH,
  tol = GATE.rgbTol,
): Promise<number> {
  async function sample(png: Buffer): Promise<Uint8ClampedArray> {
    const img = await loadImage(png);
    const canvas = createCanvas(tw, th);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, tw, th);
    return ctx.getImageData(0, 0, tw, th).data;
  }
  const da = await sample(a);
  const db = await sample(b);
  let match = 0;
  const pixels = tw * th;
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    if (
      Math.abs(da[o]! - db[o]!) <= tol &&
      Math.abs(da[o + 1]! - db[o + 1]!) <= tol &&
      Math.abs(da[o + 2]! - db[o + 2]!) <= tol
    ) {
      match++;
    }
  }
  return match / pixels;
}

/** Crop a free-grid card region, then downscale-compare (panel regression). */
async function regionMatchRatio(
  a: Buffer,
  b: Buffer,
  rect: { left: number; top: number; width: number; height: number },
  tw = GATE.regionSampleW,
  th = GATE.regionSampleH,
  tol = GATE.regionTol,
): Promise<number> {
  async function sample(png: Buffer): Promise<Uint8ClampedArray> {
    const img = await loadImage(png);
    const canvas = createCanvas(tw, th);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      0,
      0,
      tw,
      th,
    );
    return ctx.getImageData(0, 0, tw, th).data;
  }
  const da = await sample(a);
  const db = await sample(b);
  let match = 0;
  const pixels = tw * th;
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    if (
      Math.abs(da[o]! - db[o]!) <= tol &&
      Math.abs(da[o + 1]! - db[o + 1]!) <= tol &&
      Math.abs(da[o + 2]! - db[o + 2]!) <= tol
    ) {
      match++;
    }
  }
  return match / pixels;
}

describe("@allure-notifications/core collage", () => {
  it("locks PNG backend to @napi-rs/canvas", () => {
    assert.equal(PNG_BACKEND, "@napi-rs/canvas");
  });

  it("wires CORNER_RATIO / TIER_GAP_RATIO from @pyramid", () => {
    assert.equal(PYRAMID_GEOMETRY.CORNER_RATIO, CORNER_RATIO);
    assert.equal(PYRAMID_GEOMETRY.TIER_GAP_RATIO, TIER_GAP_RATIO);
    assert.equal(CORNER_RATIO, 0.18);
    assert.equal(TIER_GAP_RATIO, 0.11);
    assert.equal(STATUS_COLORS.passed, "#94ca66");
  });

  it("fixture → CB-870 free PNG with unit pie green #94ca66", async () => {
    const config = cb870Config({
      width: 870,
      height: 1080,
      allureFolder: join(fixtures, "allure3-report"),
      allureResultsFolder: join(fixtures, "allure-results"),
    });
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);
    const png = await renderCollagePng(config, analytics);

    assert.ok(png.length > 1000);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");

    const size = await pngSize(png);
    assert.equal(size.w, 870);
    assert.equal(size.h, 1080);

    const unitGreen = await countNearColor(png, { r: 0x94, g: 0xca, b: 0x66 });
    assert.ok(
      unitGreen > 50,
      `expected pie/pyramid unit green #94ca66 pixels, got ${unitGreen}`,
    );

    const outer = await countNearColor(png, { r: 34, g: 34, b: 34 }, 2, 4);
    assert.ok(outer > 20, `expected outer bg #222, got ${outer}`);

    // sha256 changes with fonts — just ensure stable non-empty digest shape
    const digest = createHash("sha256").update(png).digest("hex");
    assert.equal(digest.length, 64);
  });

  it("dogfood fixture → 1024×1280; pixel/hash vs canon", async () => {
    const config = cb870Config({
      width: 1024,
      height: 1280,
      allureFolder: join(fixtures, "dogfood-report"),
      allureResultsFolder: join(fixtures, "dogfood-results"),
    });
    const summary = await readSummary(
      join(fixtures, "dogfood-report/summary.json"),
    );
    const results = await readAllureResults(join(fixtures, "dogfood-results"));
    assert.ok(results.length >= 30, `expected dogfood results, got ${results.length}`);
    const analytics = buildAnalytics(summary, results);
    assert.ok(analytics.layers.unit! > 0);

    const png = await renderCollagePng(config, analytics);
    const size = await pngSize(png);
    assert.equal(size.w, 1024);
    assert.equal(size.h, 1280);

    const unitGreen = await countNearColor(png, { r: 0x94, g: 0xca, b: 0x66 });
    assert.ok(
      unitGreen > GATE.unitGreenMin,
      `canon unit=#94ca66 must appear in pyramid/pie, got ${unitGreen}`,
    );

    const outer = await countNearColor(png, { r: 34, g: 34, b: 34 }, 2, 4);
    assert.ok(
      outer > GATE.outerBgMin,
      `expected outer bg #222, got ${outer}`,
    );

    // Fail-closed in zds/CI: canon dir present → PNG required + gate mandatory.
    // Silent skip only outside zds (standalone GH checkout without monorepo docs).
    const canonDir = findCanonDir();
    if (!canonDir) return;
    const canonPath = findCanonPng();
    assert.ok(
      canonPath,
      `zds visual gate: missing ${CANON_PNG} under ${canonDir}`,
    );
    const canon = readFileSync(canonPath!);
    const canonSize = await pngSize(canon);
    assert.equal(canonSize.w, 1024);
    assert.equal(canonSize.h, 1280);

    const ratio = await pixelMatchRatio(png, canon);
    assert.ok(
      ratio >= GATE.fullFloor,
      `downscaled pixel match vs canon expected ≥${GATE.fullFloor} ` +
        `(${GATE.sampleW}×${GATE.sampleH}, Δ≤${GATE.rgbTol}), got ${ratio.toFixed(3)}`,
    );

    const ha = await aHash(png, GATE.aHashSize);
    const hb = await aHash(canon, GATE.aHashSize);
    const dist = hamming(ha, hb);
    assert.ok(
      dist <= GATE.aHashMaxHamming,
      `ahash Hamming vs canon expected ≤${GATE.aHashMaxHamming}/256, got ${dist}`,
    );

    // Panel regions — catch single-card regressions the full-frame average can hide.
    const regions: Array<[string, { x: number; y: number; w: number; h: number }]> = [
      ["pie", { x: 0, y: 0, w: 5, h: 5 }],
      ["pyramid", { x: 5, y: 0, w: 5, h: 5 }],
      ["durations", { x: 0, y: 5, w: 10, h: 5 }],
    ];
    for (const [name, item] of regions) {
      const rect = freeCardRect(1024, 1280, 10, 10, 14, item);
      const regionRatio = await regionMatchRatio(png, canon, rect);
      assert.ok(
        regionRatio >= GATE.regionFloor,
        `${name} region match expected ≥${GATE.regionFloor}, got ${regionRatio.toFixed(3)}`,
      );
    }
  });
});

/** Catalog stubs without TS analytics yet (+ groupBy / by variants). */
const EMPTY_STUB_TYPES = [
  "statusTransitions",
  "testBaseGrowthDynamics",
  "coverageDiff",
  "problemsDistribution",
  "stabilityDistribution",
  "durationDynamics",
  "statusAgePyramid",
] as const;

const EMPTY_STUB_ITEMS: ChartItem[] = [
  { type: "statusTransitions", x: 0, y: 0, w: 2, h: 2 },
  { type: "testBaseGrowthDynamics", x: 2, y: 0, w: 2, h: 2 },
  { type: "coverageDiff", x: 4, y: 0, w: 2, h: 2 },
  {
    type: "problemsDistribution",
    x: 6,
    y: 0,
    w: 2,
    h: 2,
    by: "environment",
  },
  {
    type: "stabilityDistribution",
    x: 8,
    y: 0,
    w: 2,
    h: 2,
    groupBy: "feature",
  },
  {
    type: "stabilityDistribution",
    x: 0,
    y: 2,
    w: 2,
    h: 2,
    groupBy: "label-name:component",
  },
  { type: "durationDynamics", x: 2, y: 2, w: 2, h: 2 },
  { type: "statusAgePyramid", x: 4, y: 2, w: 2, h: 2 },
];

describe("@allure-notifications/core empty-state panels", () => {
  it("renderEmptyPanel: themed body + muted marker (Java parity)", async () => {
    const theme = themeFromDarkMode(true);
    const analytics = buildAnalytics(
      {
        statistic: {
          total: 0,
          passed: 0,
          failed: 0,
          broken: 0,
          skipped: 0,
          unknown: 0,
        },
        durationMs: 0,
      },
      [],
    );
    const config = parseConfig({
      base: {
        project: "empty",
        allureFolder: "a",
        allureResultsFolder: "r",
        enableChart: true,
      },
    });
    const ctx = panelContext(config, theme, 320, 180, analytics, {
      showTitle: false,
    });
    const png = renderEmptyPanel(ctx);
    assert.ok(png.length > 0);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const size = await pngSize(png);
    assert.equal(size.w, 320);
    assert.equal(size.h, 180);

    const bg = await countNearColor(png, theme.background, 2, 2);
    assert.ok(bg > 1000, `expected card background pixels, got ${bg}`);

    // Marker bar uses muted gray (not emoji) — font-independent contract.
    const muted = await countNearColor(png, { r: 150, g: 150, b: 150 }, 6, 1);
    assert.ok(
      muted >= 40,
      `expected muted placeholder/marker pixels, got ${muted}`,
    );
    assert.equal(DEFAULT_EMPTY_MESSAGE, "No data yet");
  });

  it("resolveCardTitle: stub catalog ids → PANEL_CATALOG titles", () => {
    const config = parseConfig({
      base: {
        project: "Title Project",
        allureFolder: "a",
        allureResultsFolder: "r",
        enableChart: true,
      },
    });
    const analytics = buildAnalytics(
      {
        statistic: {
          total: 1,
          passed: 1,
          failed: 0,
          broken: 0,
          skipped: 0,
          unknown: 0,
        },
        durationMs: 0,
      },
      [],
    );

    assert.equal(
      resolveCardTitle({ type: "pie", x: 0, y: 0, w: 1, h: 1 }, config, analytics),
      "Title Project",
    );
    assert.equal(
      resolveCardTitle(
        { type: "currentStatus", x: 0, y: 0, w: 1, h: 1 },
        config,
        analytics,
      ),
      "Title Project",
    );
    assert.equal(
      resolveCardTitle(
        { type: "durations", x: 0, y: 0, w: 1, h: 1, groupBy: "layer" },
        config,
        analytics,
      ),
      "Durations by layer (s)",
    );

    for (const item of EMPTY_STUB_ITEMS) {
      const meta = resolvePanelMeta(item);
      assert.ok(meta, `catalog meta for ${item.type}`);
      assert.equal(
        resolveCardTitle(item, config, analytics),
        meta!.title,
        `title for ${item.type}`,
      );
    }

    // Key catalog ids (incl. analytics-deferred panels that stay empty-state for now).
    for (const id of [
      "statusTransitions",
      "coverageDiff",
      "stabilityByFeature",
      "statusDynamics",
      "successRateDistribution",
      "testResultSeverities",
    ]) {
      const meta = PANEL_CATALOG.find((p) => p.id === id);
      assert.ok(meta, id);
      const title = resolveCardTitle(
        {
          type: meta!.type,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          groupBy: meta!.groupBy,
          by: meta!.by,
        },
        config,
        analytics,
      );
      assert.equal(title, meta!.title);
    }
  });

  it("each stub type + unknown → PNG tile (no throw / no silent skip)", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);

    const items: ChartItem[] = [
      ...EMPTY_STUB_ITEMS,
      { type: "totallyUnknownPanel", x: 6, y: 2, w: 2, h: 2 },
      { type: "statusDynamics", x: 8, y: 2, w: 2, h: 2 },
    ];
    const config = parseConfig({
      base: {
        project: "empty-stubs",
        allureFolder: join(fixtures, "allure3-report"),
        allureResultsFolder: join(fixtures, "allure-results"),
        enableChart: true,
        darkMode: true,
        chart: {
          mode: "collage",
          layout: "free",
          width: 1000,
          height: 600,
          headerHeight: 34,
          cardGap: 14,
          gridCols: 10,
          gridRows: 10,
          items,
        },
      },
    });

    const png = await renderCollagePng(config, analytics);
    assert.ok(png.length > 1000);
    const size = await pngSize(png);
    assert.equal(size.w, 1000);
    assert.equal(size.h, 600);

    // Empty bodies leave muted markers; unknown must not drop the tile.
    const muted = await countNearColor(png, { r: 150, g: 150, b: 150 }, 8, 2);
    assert.ok(
      muted > 80,
      `expected empty-state markers across stub tiles, got ${muted}`,
    );

    for (const t of EMPTY_STUB_TYPES) {
      assert.ok(
        items.some((i) => i.type === t),
        `fixture includes stub ${t}`,
      );
    }
    assert.equal(
      resolveCardTitle(
        { type: "totallyUnknownPanel", x: 0, y: 0, w: 1, h: 1 },
        config,
        analytics,
      ),
      "totallyUnknownPanel",
    );
  });

  it("SQ-1080 dense mix (real + stub) renders 1080×1080", async () => {
    const summary = await readSummary(
      join(fixtures, "allure3-report/summary.json"),
    );
    const results = await readAllureResults(join(fixtures, "allure-results"));
    const analytics = buildAnalytics(summary, results);

    const raw = createSq1080Config({
      project: "SQ-1080 empty polish",
      allureFolder: join(fixtures, "allure3-report"),
      allureResultsFolder: join(fixtures, "allure-results"),
    });
    const config = parseConfig({
      ...raw,
      base: {
        ...raw.base,
        darkMode: true,
        enableChart: true,
      },
    });
    assert.equal(config.base.chart?.items?.length, DEFAULT_ITEMS.length);

    const png = await renderCollagePng(config, analytics);
    const size = await pngSize(png);
    assert.equal(size.w, 1080);
    assert.equal(size.h, 1080);
    assert.ok(png.length > 2000);

    const unitGreen = await countNearColor(png, { r: 0x94, g: 0xca, b: 0x66 });
    assert.ok(
      unitGreen > 30,
      `real pie/pyramid must still paint #94ca66, got ${unitGreen}`,
    );

    const muted = await countNearColor(png, { r: 150, g: 150, b: 150 }, 8, 2);
    assert.ok(
      muted > 40,
      `SQ-1080 stub tiles need empty-state markers, got ${muted}`,
    );
  });
});

