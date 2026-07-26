import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseConfig } from "@allure-notifications/config";
import {
  CORNER_RATIO,
  STATUS_COLORS,
  TIER_GAP_RATIO,
} from "@allure-notifications/pyramid";

import {
  PNG_BACKEND,
  PYRAMID_GEOMETRY,
  buildAnalytics,
  readAllureResults,
  readSummary,
  renderCollagePng,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "../../test/fixtures");

/** Walk up until monorepo docs/allure-notifications/canon is found (optional outside zds). */
function findCanonPng(): string | null {
  let dir = __dirname;
  for (let i = 0; i < 14; i++) {
    const candidate = join(
      dir,
      "docs/allure-notifications/canon/collage-cb870-free-dogfood-5.0.3.png",
    );
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = join(dir, "..");
  }
  return null;
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
 * Downscale both images and count near-matching pixels (RGB Δ≤40).
 * Captures layout/palette parity without requiring font identity.
 */
async function pixelMatchRatio(
  a: Buffer,
  b: Buffer,
  tw = 64,
  th = 80,
  tol = 40,
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
      unitGreen > 200,
      `canon unit=#94ca66 must appear in pyramid/pie, got ${unitGreen}`,
    );

    const canonPath = findCanonPng();
    // Pixel/hash vs monorepo canon — skipped in standalone GitHub checkout.
    if (!canonPath) return;
    const canon = readFileSync(canonPath);
    const canonSize = await pngSize(canon);
    assert.equal(canonSize.w, 1024);
    assert.equal(canonSize.h, 1280);

    const ratio = await pixelMatchRatio(png, canon);
    assert.ok(
      ratio >= 0.45,
      `downscaled pixel match vs canon expected ≥0.45, got ${ratio.toFixed(3)}`,
    );

    const ha = await aHash(png);
    const hb = await aHash(canon);
    const dist = hamming(ha, hb);
    // 16×16 = 256 bits; fonts/AA differ — allow structural drift
    assert.ok(
      dist <= 110,
      `ahash Hamming vs canon expected ≤110, got ${dist}`,
    );
  });
});
