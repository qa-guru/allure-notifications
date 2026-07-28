/**
 * Plaque number stepper — ± sides (canon).
 * Enhances bare `input[type=number].plaque-field__control` and handles ± clicks.
 */

const BTN_CLASS = 'plaque-number__btn';

/**
 * @param {HTMLInputElement} input
 * @param {number} dir
 */
export function stepPlaqueNumber(input, dir) {
  if (!(input instanceof HTMLInputElement) || input.disabled || input.readOnly) return;
  const step = Number(input.step);
  const stepVal = Number.isFinite(step) && step > 0 ? step : 1;
  const min = input.min === '' ? -Infinity : Number(input.min);
  const max = input.max === '' ? Infinity : Number(input.max);
  let cur = input.value === '' ? 0 : Number(input.value);
  if (!Number.isFinite(cur)) cur = 0;
  let next = cur + dir * stepVal;
  if (Number.isFinite(min)) next = Math.max(min, next);
  if (Number.isFinite(max)) next = Math.min(max, next);
  input.value = String(next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  syncPlaqueNumberDisabled(input);
}

/**
 * @param {HTMLInputElement} input
 */
export function syncPlaqueNumberDisabled(input) {
  const host = input.closest('.plaque-number');
  if (!host) return;
  const min = input.min === '' ? -Infinity : Number(input.min);
  const max = input.max === '' ? Infinity : Number(input.max);
  const cur = input.value === '' ? NaN : Number(input.value);
  const dec = host.querySelector('[data-plaque-number-dir="-1"]');
  const inc = host.querySelector('[data-plaque-number-dir="1"]');
  if (dec instanceof HTMLButtonElement) {
    dec.disabled = input.disabled || (Number.isFinite(cur) && Number.isFinite(min) && cur <= min);
  }
  if (inc instanceof HTMLButtonElement) {
    inc.disabled = input.disabled || (Number.isFinite(cur) && Number.isFinite(max) && cur >= max);
  }
}

/** Geometric ± — font U+2212/− sits off the digit optical center. */
const SVG_DEC =
  '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">' +
  '<path d="M2 5h6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '</svg>';
const SVG_INC =
  '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">' +
  '<path d="M2 5h6M5 2v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '</svg>';

/**
 * @param {number} dir
 * @param {string} label
 * @returns {HTMLButtonElement}
 */
function makeBtn(dir, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = BTN_CLASS;
  btn.setAttribute('data-plaque-number-dir', String(dir));
  btn.setAttribute('aria-label', label);
  btn.tabIndex = -1;
  btn.innerHTML = dir < 0 ? SVG_DEC : SVG_INC;
  return btn;
}

/**
 * Replace legacy text −/+ in static markup with centered SVG.
 * @param {ParentNode} [root=document]
 */
export function normalizePlaqueNumberGlyphs(root) {
  const scope = root || document;
  scope.querySelectorAll('.plaque-number__btn[data-plaque-number-dir]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    if (btn.querySelector('svg')) return;
    const dir = Number(btn.getAttribute('data-plaque-number-dir'));
    btn.innerHTML = dir < 0 ? SVG_DEC : SVG_INC;
  });
}

/**
 * Wrap a bare number control in `.plaque-number` with ± sides.
 * @param {HTMLInputElement} input
 * @returns {HTMLElement | null}
 */
export function wrapPlaqueNumber(input) {
  if (!(input instanceof HTMLInputElement)) return null;
  if (input.type !== 'number') return null;
  if (!input.classList.contains('plaque-field__control')) return null;
  if (input.closest('.plaque-number')) {
    syncPlaqueNumberDisabled(input);
    return input.closest('.plaque-number');
  }
  const parent = input.parentNode;
  if (!parent) return null;

  const host = document.createElement('span');
  host.className = 'plaque-number';
  parent.insertBefore(host, input);
  host.appendChild(makeBtn(-1, 'Уменьшить'));
  host.appendChild(input);
  host.appendChild(makeBtn(1, 'Увеличить'));
  syncPlaqueNumberDisabled(input);
  return host;
}

/**
 * @param {ParentNode} [root=document]
 */
export function enhancePlaqueNumbers(root) {
  const scope = root || document;
  scope.querySelectorAll('input[type="number"].plaque-field__control').forEach((el) => {
    if (el instanceof HTMLInputElement) wrapPlaqueNumber(el);
  });
  normalizePlaqueNumberGlyphs(scope);
}

let bound = false;

/**
 * Document-level click + input sync (idempotent).
 * @param {ParentNode} [root=document]
 */
export function bindPlaqueNumbers(root) {
  enhancePlaqueNumbers(root || document);
  if (bound) return;
  bound = true;
  document.addEventListener('click', (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    const btn = t.closest('[data-plaque-number-dir]');
    if (!btn) return;
    const host = btn.closest('.plaque-number');
    const input = host && host.querySelector('input[type="number"]');
    if (!(input instanceof HTMLInputElement)) return;
    event.preventDefault();
    const dir = Number(btn.getAttribute('data-plaque-number-dir'));
    if (!Number.isFinite(dir) || dir === 0) return;
    stepPlaqueNumber(input, dir);
  });
  document.addEventListener('input', (event) => {
    const t = event.target;
    if (t instanceof HTMLInputElement && t.closest('.plaque-number')) {
      syncPlaqueNumberDisabled(t);
    }
  });
}

function autoInit() {
  bindPlaqueNumbers(document);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
