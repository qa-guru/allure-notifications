/**
 * T4 — quality-gate canvas panel PNG from kit fixtures / layout IR.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { createCanvas, loadImage } from "@napi-rs/canvas";
import {
  QUALITY_GATE_FIXTURE_IDS,
  buildQualityGateLayout,
  parseKitQualityGateData,
  type QualityGateFixtureId,
} from "@qa-guru/allure-report-kit";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

import {
  QUALITY_GATE_TOKEN_PALETTE,
  renderQualityGatePng,
} from "../src/collage/panels/qualityGate.js";

declareSuite({
  feature: "core-collage",
  story: "Quality-gate canvas PNG",
  layer: "unit",
  component: "@qa-guru/allure-notifications-core",
  severity: "normal",
});

const PANEL_W = 480;
const PANEL_H = 240;
const PNG_MAGIC = "89504e470d0a1a0a";
const SUCCESS = QUALITY_GATE_TOKEN_PALETTE["--color-success"]!;
const DANGER = QUALITY_GATE_TOKEN_PALETTE["--color-danger"]!;

function loadFixture(id: QualityGateFixtureId): unknown {
  const url = import.meta.resolve(
    `@qa-guru/allure-report-kit/fixtures/quality-gate/${id}.json`,
  );
  return JSON.parse(readFileSync(fileURLToPath(url), "utf8"));
}

async function pngSize(png: Buffer): Promise<{ w: number; h: number }> {
  const img = await loadImage(png);
  return { w: img.width, h: img.height };
}

async function countNearColor(
  png: Buffer,
  target: { r: number; g: number; b: number },
  tol = 10,
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
      const dr = Math.abs(data[i]! - target.r);
      const dg = Math.abs(data[i + 1]! - target.g);
      const db = Math.abs(data[i + 2]! - target.b);
      if (dr <= tol && dg <= tol && db <= tol) {
        count += 1;
      }
    }
  }
  return count;
}

/** Average hash — tolerant across font rasterization differences. */
async function aHash(png: Buffer, size = 8): Promise<bigint> {
  const img = await loadImage(png);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
  }
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  let hash = 0n;
  for (const g of gray) {
    hash = (hash << 1n) | (g >= avg ? 1n : 0n);
  }
  return hash;
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

describe("renderQualityGatePng", () => {
  it("renders each kit fixture to a non-empty PNG of requested size", async () => {
    for (const id of QUALITY_GATE_FIXTURE_IDS) {
      const png = renderQualityGatePng(loadFixture(id), {
        width: PANEL_W,
        height: PANEL_H,
      });
      assert.ok(png.length > 500, `${id}: expected non-trivial PNG`);
      assert.equal(png.subarray(0, 8).toString("hex"), PNG_MAGIC, `${id}: PNG magic`);
      const size = await pngSize(png);
      assert.equal(size.w, PANEL_W, `${id}: width`);
      assert.equal(size.h, PANEL_H, `${id}: height`);
    }
  });

  it("passed fixtures paint success indicator pixels; failed paint danger", async () => {
    const passedIds: QualityGateFixtureId[] = ["aqg-passed", "sqg-passed"];
    const failedIds: QualityGateFixtureId[] = ["aqg-failed", "sqg-failed", "sqg-long"];

    for (const id of passedIds) {
      const png = renderQualityGatePng(loadFixture(id), {
        width: PANEL_W,
        height: PANEL_H,
      });
      const green = await countNearColor(png, SUCCESS, 12, 1);
      assert.ok(green >= 20, `${id}: expected success pixels, got ${green}`);
    }

    for (const id of failedIds) {
      const png = renderQualityGatePng(loadFixture(id), {
        width: PANEL_W,
        height: PANEL_H,
      });
      const red = await countNearColor(png, DANGER, 12, 1);
      assert.ok(red >= 20, `${id}: expected danger pixels, got ${red}`);
    }
  });

  it("accepts prebuilt layout IR from buildQualityGateLayout", async () => {
    const data = parseKitQualityGateData(loadFixture("aqg-passed"));
    const layout = buildQualityGateLayout(data);
    const fromLayout = renderQualityGatePng(layout, {
      width: PANEL_W,
      height: PANEL_H,
    });
    const fromData = renderQualityGatePng(data, {
      width: PANEL_W,
      height: PANEL_H,
    });
    // Same IR path → identical PNG (no font/time noise between calls).
    assert.equal(
      createHash("sha256").update(fromLayout).digest("hex"),
      createHash("sha256").update(fromData).digest("hex"),
    );
  });

  it("aHash stays stable across re-renders of the same fixture", async () => {
    const a = renderQualityGatePng(loadFixture("sqg-failed"), {
      width: PANEL_W,
      height: PANEL_H,
    });
    const b = renderQualityGatePng(loadFixture("sqg-failed"), {
      width: PANEL_W,
      height: PANEL_H,
    });
    const ha = await aHash(a);
    const hb = await aHash(b);
    assert.equal(hamming(ha, hb), 0);
  });

  it("does not draw ordinary widget-tile bar chrome above quality-gate bar", async () => {
    // QG owns its 28px bar; surface outside that band should not be collage header gray.
    const png = renderQualityGatePng(loadFixture("aqg-passed"), {
      width: PANEL_W,
      height: PANEL_H,
    });
    const headerGray = await countNearColor(png, { r: 60, g: 60, b: 60 }, 2, 2);
    assert.equal(headerGray, 0, "unexpected collage dark header chrome");
  });
});
