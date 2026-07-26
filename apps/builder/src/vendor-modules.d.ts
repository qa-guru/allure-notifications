declare module "*code-highlight.js" {
  export function mountHighlightedOutput(
    el: HTMLElement | null,
    text: string,
    kind?: string,
  ): void;
}
