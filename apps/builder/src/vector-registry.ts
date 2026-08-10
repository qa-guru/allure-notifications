import { mountHighlightedOutput } from '../vendor/design-system/js/code-highlight.js';
import { createDefaultState, state } from './state.js';

/** Stable alias — always resolves to code SSOT (`createDefaultConfig` / DEFAULT_ITEMS). */
export const DEFAULT_VECTOR_ID = 'vector#default';

export const VECTOR_REGISTRY_KEY = 'anb-apps-builder-vector-registry';
/** Pre-rename key — migrate once into `VECTOR_REGISTRY_KEY`. */
export const VECTOR_REGISTRY_KEY_LEGACY = 'allure-notifications-builder-vector-registry';

let vectorDraft: string | null = null;
let vectorMiss = false;

/**
 * Same 8-hex fingerprint as autotests-builder / selenoid / react-ui demo.
 * @param {unknown} value
 */
export function vectorHash(value: unknown) {
  const str = JSON.stringify(value);
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return (`00000000${(h >>> 0).toString(16)}`).slice(-8);
}

/**
 * @param {string} raw
 */
export function normalizeVectorId(raw: string) {
  let id = String(raw || '').trim();
  if (!id) return '';
  id = id.replace(/^vector\s*[:#]?\s*/i, '').replace(/^#/, '').trim();
  if (!id) return '';
  return `vector#${id}`;
}

/** Caps snap for hash / registry — no `vector` field (avoid cycle). */
export function capsSnap() {
  return {
    base: state.base,
    telegram: state.telegram,
  };
}

export function fingerprint() {
  return `vector#${vectorHash(capsSnap())}`;
}

/**
 * @param {Record<string, unknown>} snap
 */
export function cloneSnap(snap: Record<string, unknown>) {
  return /** @type {Record<string, unknown>} */ (JSON.parse(JSON.stringify(snap)));
}

/** @returns {Map<string, Record<string, unknown>>} */
export function loadVectorRegistry(): Map<string, Record<string, unknown>> {
  const map = new Map();
  const defaults = createDefaultState();
  const defaultFp = fingerprintFromSnap(defaults);
  map.set(defaultFp, cloneSnap(defaults));
  map.set(DEFAULT_VECTOR_ID, cloneSnap(defaults));
  try {
    let raw = localStorage.getItem(VECTOR_REGISTRY_KEY);
    if (!raw) {
      raw = localStorage.getItem(VECTOR_REGISTRY_KEY_LEGACY);
      if (raw) {
        localStorage.setItem(VECTOR_REGISTRY_KEY, raw);
        localStorage.removeItem(VECTOR_REGISTRY_KEY_LEGACY);
      }
    }
    if (!raw) return map;
    const parsed = JSON.parse(raw);
    for (const [id, snap] of Object.entries(parsed)) {
      /* Code SSOT wins over a stale localStorage `vector#default`. */
      if (id === DEFAULT_VECTOR_ID) continue;
      if (snap && typeof snap === 'object' && 'base' in snap) {
        map.set(id, cloneSnap(/** @type {Record<string, unknown>} */ (snap)));
      }
    }
  } catch {
    /* corrupt / private mode */
  }
  return map;
}

/**
 * @param {Record<string, unknown>} snap
 */
export function fingerprintFromSnap(snap: Record<string, unknown>) {
  return `vector#${vectorHash({ base: snap.base, telegram: snap.telegram })}`;
}

/** @type {Map<string, Record<string, unknown>>} */
export const vectorRegistry = loadVectorRegistry();

/**
 * @param {Record<string, unknown>} snap
 */
export function rememberSnap(snap: Record<string, unknown>) {
  const id = fingerprintFromSnap(snap);
  vectorRegistry.set(id, cloneSnap(snap));
  /* Keep alias pointed at code SSOT (not the live edited snap). */
  vectorRegistry.set(DEFAULT_VECTOR_ID, cloneSnap(createDefaultState()));
  try {
    const obj: Record<string, Record<string, unknown>> = {};
    vectorRegistry.forEach((s, key) => {
      if (key === DEFAULT_VECTOR_ID) return;
      obj[key] = s;
    });
    localStorage.setItem(VECTOR_REGISTRY_KEY, JSON.stringify(obj));
  } catch {
    /* private mode / quota */
  }
  return id;
}

export function configJsonText() {
  const vector = fingerprint();
  return JSON.stringify({ ...cloneSnap(capsSnap()), vector }, null, 2);
}

export function renderVectorInput() {
  const input = document.getElementById('anb-term-vector');
  if (!(input instanceof HTMLInputElement)) return;
  const vectorId = fingerprint();
  if (vectorDraft == null) {
    input.value = vectorId;
  }
  input.size = Math.max(12, (vectorDraft ?? vectorId).length);
  input.classList.toggle('anb-vector-input--miss', vectorMiss);
  input.setAttribute('aria-invalid', vectorMiss ? 'true' : 'false');
  input.title = vectorMiss
    ? 'Не найден в localStorage — сначала получи этот vector, меняя опции'
    : 'Отпечаток конфига · Enter — подтянуть · vector#default — CB-870 layout';
}

export function renderTerminal() {
  rememberSnap(capsSnap());
  const el = document.getElementById('anb-terminal');
  mountHighlightedOutput(el, configJsonText(), 'json');
  if (vectorDraft == null) renderVectorInput();
}

export function getVectorDraft() {
  return vectorDraft;
}

export function setVectorDraft(v: string | null) {
  vectorDraft = v;
}

export function getVectorMiss() {
  return vectorMiss;
}

export function setVectorMiss(v: boolean) {
  vectorMiss = v;
}
