/**
 * Pie / donut panel — port of Java PiePanel (Canvas 2D).
 */

import type { SKRSContext2D } from "@napi-rs/canvas";
import { createCanvas } from "@napi-rs/canvas";

import type { Statistic } from "../../report/types.js";
import {
  STATUS_RGB,
  rgbCss,
  type ChartTheme,
  type Rgb,
} from "../../theme.js";
import type { PanelContext } from "../context.js";

const RING_STROKE_RATIO = 0.085;
const RING_MARGIN_RATIO = 0.14;
const PCT_FONT_RATIO = 0.15;
const SUB_FONT_RATIO = 0.06;
const SEGMENT_GAP_DEGREES = 3.0;

type Segment = { value: number; color: Rgb };

function headlineText(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 236, g: 239, b: 244 }
    : { r: 46, g: 52, b: 64 };
}

function mutedText(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 150, g: 150, b: 150 }
    : { r: 138, g: 148, b: 166 };
}

function emptyRing(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 80, g: 80, b: 80 }
    : { r: 224, g: 226, b: 230 };
}

function buildSegments(statistic: Statistic): Segment[] {
  const segments: Segment[] = [];
  const add = (value: number, color: Rgb) => {
    if (value > 0) {
      segments.push({ value, color });
    }
  };
  add(statistic.passed, STATUS_RGB.passed);
  add(statistic.failed, STATUS_RGB.failed);
  add(statistic.broken, STATUS_RGB.broken);
  add(statistic.skipped, STATUS_RGB.skipped);
  add(statistic.unknown, STATUS_RGB.unknown);
  return segments;
}

function drawCenterText(
  ctx: SKRSContext2D,
  centerX: number,
  centerY: number,
  side: number,
  passed: number,
  total: number,
  theme: ChartTheme,
): void {
  const percentage = total > 0 ? (passed / total) * 100 : 0;
  const percentageText = `${percentage.toFixed(2)}%`;
  const subText = `of ${total}`;

  const pctSize = Math.round(side * PCT_FONT_RATIO);
  const subSize = Math.round(side * SUB_FONT_RATIO);

  ctx.font = `bold ${pctSize}px sans-serif`;
  const pctWidth = ctx.measureText(percentageText).width;
  const pctAscent = pctSize * 0.8;

  ctx.font = `${subSize}px sans-serif`;
  const subWidth = ctx.measureText(subText).width;
  const subAscent = subSize * 0.8;

  const lineGap = side * 0.02;
  const blockHeight = pctAscent + lineGap + subAscent;
  const top = centerY - blockHeight / 2;

  ctx.font = `bold ${pctSize}px sans-serif`;
  ctx.fillStyle = rgbCss(headlineText(theme));
  ctx.fillText(percentageText, centerX - pctWidth / 2, top + pctAscent);

  ctx.font = `${subSize}px sans-serif`;
  ctx.fillStyle = rgbCss(mutedText(theme));
  ctx.fillText(
    subText,
    centerX - subWidth / 2,
    top + pctAscent + lineGap + subAscent,
  );
}

function drawDonut(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  statistic: Statistic,
  theme: ChartTheme,
): void {
  const segments = buildSegments(statistic);
  const segmentSum = segments.reduce((s, seg) => s + seg.value, 0);
  const total = statistic.total || segmentSum;
  const passed = statistic.passed;

  const side = Math.min(width, height);
  const stroke = side * RING_STROKE_RATIO;
  const diameter = side - side * RING_MARGIN_RATIO - stroke;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = diameter / 2;

  ctx.lineWidth = stroke;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const strokeArc = (startDeg: number, sweepDeg: number, color: Rgb) => {
    // Canvas: 0° = east, CCW positive. Java Arc2D: 0° = east, CCW positive,
    // but PiePanel starts at 90° and sweeps clockwise (negative).
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = ((startDeg + sweepDeg) * Math.PI) / 180;
    ctx.beginPath();
    ctx.strokeStyle = rgbCss(color);
    ctx.arc(centerX, centerY, radius, -startRad, -endRad, sweepDeg > 0);
    ctx.stroke();
  };

  if (segmentSum <= 0) {
    strokeArc(0, 360, emptyRing(theme));
  } else if (segments.length === 1) {
    strokeArc(0, 360, segments[0]!.color);
  } else {
    const capAngle = (stroke / 2 / radius) * (180 / Math.PI);
    const minSlot = SEGMENT_GAP_DEGREES + 2 * capAngle;

    const slots = segments.map((seg) => (seg.value / segmentSum) * 360);
    let largest = 0;
    for (let i = 1; i < slots.length; i++) {
      if (slots[i]! > slots[largest]!) {
        largest = i;
      }
    }
    let deficit = 0;
    for (let i = 0; i < slots.length; i++) {
      if (i !== largest && slots[i]! < minSlot) {
        deficit += minSlot - slots[i]!;
        slots[i] = minSlot;
      }
    }
    slots[largest] = Math.max(slots[largest]! - deficit, minSlot);

    let angle = 90; // top, clockwise
    for (let i = 0; i < segments.length; i++) {
      const footprint = slots[i]! - SEGMENT_GAP_DEGREES;
      const sweep = Math.max(footprint - 2 * capAngle, 0.01);
      const start = angle - (SEGMENT_GAP_DEGREES / 2 + capAngle);
      // Draw clockwise: start at `start`, sweep negative in Java; here use strokeArc
      // with negative sweep via end < start in clockwise mode.
      strokeArc(start, -sweep, segments[i]!.color);
      angle -= slots[i]!;
    }
  }

  drawCenterText(ctx, centerX, centerY, side, passed, total, theme);
}

export function renderPiePanel(context: PanelContext): Buffer {
  const { width, height, theme, analytics } = context;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rgbCss(theme.background);
  ctx.fillRect(0, 0, width, height);
  drawDonut(ctx, width, height, analytics.statistic, theme);
  return canvas.toBuffer("image/png");
}
