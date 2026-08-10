import { createDefaultConfig } from '@qa-guru/allure-notifications-config';

export type BuilderState = ReturnType<typeof createDefaultConfig>;

export function createDefaultState(): BuilderState {
  return createDefaultConfig();
}

export const state: BuilderState = createDefaultState();

/**
 * @param {string} path
 * @returns {{ parent: Record<string, unknown>, key: string } | null}
 */
export function resolvePath(path: string): { parent: Record<string, unknown>; key: string } | null {
  const parts = path.split('.');
  if (parts.length < 2) return null;
  let cur: Record<string, unknown> = state as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i]!;
    const next = cur[key];
    if (next == null || typeof next !== 'object') return null;
    cur = next as Record<string, unknown>;
  }
  return { parent: cur, key: parts[parts.length - 1]! };
}

/**
 * @param {string} path
 * @returns {unknown}
 */
export function getPath(path: string): unknown {
  const resolved = resolvePath(path);
  if (!resolved) return undefined;
  return resolved.parent[resolved.key];
}

/**
 * @param {string} path
 * @param {unknown} value
 */
export function setPath(path: string, value: unknown) {
  const resolved = resolvePath(path);
  if (!resolved) return;
  resolved.parent[resolved.key] = value;
}

/**
 * @param {HTMLInputElement | HTMLSelectElement} el
 * @returns {unknown}
 */
export function controlValue(el: HTMLInputElement | HTMLSelectElement): unknown {
  if (el instanceof HTMLInputElement && el.hasAttribute('data-anb-number')) {
    const n = Number(el.value);
    return Number.isFinite(n) ? n : 0;
  }
  return el.value;
}
