/** Ambient shims for browser globals + DS vendor (not type-checked sources). */

declare module '../vendor/design-system/js/code-highlight.js' {
  export function mountHighlightedOutput(
    el: HTMLElement | null,
    text: string,
    kind?: string,
  ): void;
}

declare module '*code-highlight.js' {
  export function mountHighlightedOutput(
    el: HTMLElement | null,
    text: string,
    kind?: string,
  ): void;
}

declare module '../vendor/design-system/js/theme-icons.js' {
  export function syncThemeToggleIcon(
    themeBtn: HTMLElement | null | undefined,
  ): void;
}

declare module '*theme-icons.js' {
  export function syncThemeToggleIcon(
    themeBtn: HTMLElement | null | undefined,
  ): void;
}

interface GridStackNode {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  minW?: number;
  minH?: number;
  type?: string;
  el?: HTMLElement;
}

interface GridStackEngine {
  nodes?: GridStackNode[];
}

interface GridStack {
  on(event: string, callback: (...args: unknown[]) => void): void;
  update(el: HTMLElement, opts: { x?: number; y?: number; w?: number; h?: number }): void;
  removeWidget(el: HTMLElement, removeDOM?: boolean, triggerEvent?: boolean): void;
  removeAll(removeDOM?: boolean): void;
  makeWidget(el: HTMLElement): void;
  getGridItems(): HTMLElement[];
  cellHeight(val: number | string): void;
  setAnimation?(on: boolean): void;
  onParentResize?(): void;
  opts?: { animate?: boolean };
  engine?: GridStackEngine;
}

interface GridStackStatic {
  init(opts: Record<string, unknown>, selector?: string | HTMLElement): GridStack;
}

interface WidgetTileMocksApi {
  fill(root?: ParentNode | null, opts?: { force?: boolean }): void;
  tierForSpan?(cols: number, w: number, h: number): string;
}

interface HTMLElement {
  gridstackNode?: GridStackNode;
}

interface Window {
  WidgetTileMocks?: WidgetTileMocksApi;
}

declare var GridStack: GridStackStatic | undefined;
declare var WidgetTileMocks: WidgetTileMocksApi | undefined;
