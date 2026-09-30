/**
 * Deterministic font stacks for node-canvas renders.
 *
 * On Linux runners fontconfig may resolve generic `sans-serif`/`monospace` to
 * a font without Cyrillic coverage (e.g. Bitstream Charter on ubuntu-latest),
 * which silently drops glyphs like "Пройден". Probing well-known font files
 * and putting the found families first in the stack keeps renders
 * deterministic; where none exist the stack falls back to generics as before.
 */

import { existsSync } from "node:fs";

import { GlobalFonts } from "@napi-rs/canvas";

const FONT_FILES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
  "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
  "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
  "/usr/share/fonts/liberation/LiberationMono-Regular.ttf",
  "/usr/share/fonts/liberation/LiberationMono-Bold.ttf",
  "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
  "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansMono-Regular.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansMono-Bold.ttf",
];

export function registerFonts(
  paths: readonly string[] = FONT_FILES,
  register: (path: string) => unknown = (path) =>
    GlobalFonts.registerFromPath(path),
): void {
  for (const path of paths) {
    try {
      if (existsSync(path)) {
        register(path);
      }
    } catch {
      // best effort — generic families still apply
    }
  }
}

registerFonts();

export const SANS_SERIF =
  '"DejaVu Sans", "Liberation Sans", "Noto Sans", sans-serif';
export const MONO =
  '"DejaVu Sans Mono", "Liberation Mono", "Noto Sans Mono", ui-monospace, "SF Mono", Menlo, monospace';
