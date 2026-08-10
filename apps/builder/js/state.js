import { createDefaultConfig } from '@qa-guru/allure-notifications-config';
export function createDefaultState() {
    return createDefaultConfig();
}
export const state = createDefaultState();
/**
 * @param {string} path
 * @returns {{ parent: Record<string, unknown>, key: string } | null}
 */
export function resolvePath(path) {
    const parts = path.split('.');
    if (parts.length < 2)
        return null;
    let cur = state;
    for (let i = 0; i < parts.length - 1; i += 1) {
        const key = parts[i];
        const next = cur[key];
        if (next == null || typeof next !== 'object')
            return null;
        cur = next;
    }
    return { parent: cur, key: parts[parts.length - 1] };
}
/**
 * @param {string} path
 * @returns {unknown}
 */
export function getPath(path) {
    const resolved = resolvePath(path);
    if (!resolved)
        return undefined;
    return resolved.parent[resolved.key];
}
/**
 * @param {string} path
 * @param {unknown} value
 */
export function setPath(path, value) {
    const resolved = resolvePath(path);
    if (!resolved)
        return;
    resolved.parent[resolved.key] = value;
}
/**
 * @param {HTMLInputElement | HTMLSelectElement} el
 * @returns {unknown}
 */
export function controlValue(el) {
    if (el instanceof HTMLInputElement && el.hasAttribute('data-anb-number')) {
        const n = Number(el.value);
        return Number.isFinite(n) ? n : 0;
    }
    return el.value;
}
