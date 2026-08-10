/**
 * Chart theme — mirrors Java ChartTheme.
 */

import { STATUS_COLORS } from "@qa-guru/allure-notifications-pyramid";

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbCss(c: Rgb): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

export function mixRgb(color: Rgb, background: Rgb, weight: number): Rgb {
  const rest = 1 - weight;
  return {
    r: Math.round(color.r * weight + background.r * rest),
    g: Math.round(color.g * weight + background.g * rest),
    b: Math.round(color.b * weight + background.b * rest),
  };
}

export const STATUS_RGB = {
  passed: hexToRgb(STATUS_COLORS.passed),
  failed: hexToRgb(STATUS_COLORS.failed),
  broken: hexToRgb(STATUS_COLORS.broken),
  skipped: hexToRgb(STATUS_COLORS.skipped),
  unknown: hexToRgb(STATUS_COLORS.unknown),
} as const;

export type ChartTheme = {
  dark: boolean;
  background: Rgb;
  text: Rgb;
  accent: Rgb;
};

export function themeFromDarkMode(darkMode: boolean | undefined): ChartTheme {
  if (darkMode) {
    return {
      dark: true,
      background: { r: 50, g: 50, b: 50 },
      text: { r: 220, g: 220, b: 220 },
      accent: { r: 59, g: 130, b: 246 },
    };
  }
  return {
    dark: false,
    background: { r: 255, g: 255, b: 255 },
    text: { r: 0, g: 0, b: 0 },
    accent: { r: 37, g: 99, b: 235 },
  };
}

export function outerBackground(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 34, g: 34, b: 34 }
    : { r: 240, g: 240, b: 242 };
}

export function cardBorder(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 96, g: 96, b: 96 }
    : { r: 210, g: 210, b: 214 };
}

export function headerBackground(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 60, g: 60, b: 60 }
    : { r: 247, g: 247, b: 249 };
}

export function headerText(theme: ChartTheme): Rgb {
  return theme.dark
    ? { r: 180, g: 180, b: 180 }
    : { r: 90, g: 90, b: 90 };
}

/** Chromatic kit tokens — shared across light/dark collage kit panels. */
const KIT_CHROMATIC_TOKENS: Readonly<Record<string, Rgb>> = {
  "--color-success": hexToRgb("#49cb68"),
  "--color-danger": hexToRgb("#fd5a3e"),
  "--color-warning": hexToRgb("#f59e0b"),
  "--color-primary": hexToRgb("#20aee3"),
  "--color-status-passed-chart": hexToRgb("#49cb68"),
};

/**
 * Kit `theme/kit.css` light chrome — canvas PNG parity with classic panel `theme.background`.
 */
export const KIT_LIGHT_TOKEN_PALETTE: Readonly<Record<string, Rgb>> = {
  ...KIT_CHROMATIC_TOKENS,
  "--color-surface": hexToRgb("#ffffff"),
  "--color-surface-soft": hexToRgb("#f2f2f2"),
  "--color-text": hexToRgb("#1c1917"),
  "--color-text-muted": { r: 28, g: 25, b: 23 },
  "--color-border": { r: 127, g: 127, b: 127 },
};

/**
 * Dark collage kit chrome — parity with `themeFromDarkMode` card body / DS dark tokens.
 */
export const KIT_DARK_TOKEN_PALETTE: Readonly<Record<string, Rgb>> = {
  ...KIT_CHROMATIC_TOKENS,
  "--color-surface": { r: 50, g: 50, b: 50 },
  "--color-surface-soft": { r: 60, g: 60, b: 60 },
  "--color-text": { r: 220, g: 220, b: 220 },
  "--color-text-muted": { r: 180, g: 180, b: 180 },
  "--color-border": { r: 96, g: 96, b: 96 },
};

/** Resolve kit token palette for collage kit PNG panels (quality-gate, tests-table). */
export function resolveKitPalette(
  dark?: boolean,
  overrides?: Readonly<Record<string, Rgb>>,
): Record<string, Rgb> {
  const base = dark ? KIT_DARK_TOKEN_PALETTE : KIT_LIGHT_TOKEN_PALETTE;
  return { ...base, ...(overrides ?? {}) };
}
