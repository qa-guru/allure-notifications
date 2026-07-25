/**
 * Content-driven responsive stages for metrics header
 * (`.header:has(.selenoid-header-group)`).
 *
 * `.header--metrics-nav-fold` — brand + nav + metrics + tools no longer fit →
 *   hide inline nav, show burger (Stats/Capabilities/Videos stay after the logo
 *   until they actually collide with the tiles).
 * `.header--metrics-wrap` — after nav fold, brand + metrics + burger collide →
 *   metrics on band 2; brand + burger stay on band 1.
 *
 * ResizeObserver — not fixed px breakpoints. Hysteresis like panel-bar-wrap.js.
 */

const NAV_FOLD = 'header--metrics-nav-fold';
const WRAP = 'header--metrics-wrap';
/** px: enter stage when content overflows by this much */
const SLACK_ENTER = 1;
/** px: exit stage only when this much spare room exists (anti-flicker) */
const SLACK_EXIT = 24;

/** @type {WeakMap<HTMLElement, { ro?: ResizeObserver, mo?: MutationObserver, raf?: number, navW?: number }>} */
const state = new WeakMap();

/** @param {CSSStyleDeclaration} styles */
function gapPx(styles) {
  const raw = styles.columnGap || styles.gap || '0';
  return parseFloat(String(raw).split(' ')[0]) || 0;
}

/**
 * Intrinsic row width from flex/inline children. Do NOT use the container's
 * offsetWidth when it flex-grows (`nav`) or is `width: 100%` (wrapped group).
 * @param {HTMLElement} el
 */
function childrenRowWidth(el) {
  const kids = el.children;
  const n = kids.length;
  if (!n) {
    return 0;
  }
  let w = 0;
  for (let i = 0; i < n; i++) {
    w += /** @type {HTMLElement} */ (kids[i]).offsetWidth;
  }
  const gap = gapPx(getComputedStyle(el));
  if (gap > 0 && n > 1) {
    w += (n - 1) * gap;
  }
  return w;
}

/**
 * Nav has `flex: 1 1 auto` so offsetWidth grows. Prefer children sum while nav
 * is laid out; when folded (`display: none`) reuse last measured intrinsic —
 * never re-read children while hidden (some still report partial offsetWidth
 * and would corrupt the cache).
 * @param {HTMLElement} header
 * @param {HTMLElement | null} nav
 */
function navIntrinsicWidth(header, nav) {
  const s = state.get(header) ?? {};
  if (!nav) {
    return s.navW ?? 0;
  }
  if (getComputedStyle(nav).display === 'none') {
    return s.navW ?? 0;
  }
  const w = childrenRowWidth(nav);
  if (w > 0) {
    s.navW = w;
    state.set(header, s);
    return w;
  }
  return s.navW ?? 0;
}

/**
 * @param {HTMLElement} header
 * @returns {{
 *   available: number,
 *   withNav: number,
 *   withoutNav: number,
 * } | null}
 */
function measure(header) {
  const inner = header.querySelector('.header__inner');
  const brand = header.querySelector('.header__brand');
  const nav = header.querySelector('.header__nav');
  const tools = header.querySelector('.header__tools');
  const group = header.querySelector('.selenoid-header-group');
  if (
    !(inner instanceof HTMLElement) ||
    !(brand instanceof HTMLElement) ||
    !(tools instanceof HTMLElement) ||
    !(group instanceof HTMLElement)
  ) {
    return null;
  }

  const available = inner.clientWidth;
  if (available <= 0) {
    return null;
  }

  const styles = getComputedStyle(inner);
  const pad =
    (parseFloat(styles.paddingLeft) || 0) +
    (parseFloat(styles.paddingRight) || 0);
  const gap = gapPx(styles);
  const brandW = brand.offsetWidth;
  const groupW = childrenRowWidth(group);
  const toolsW = tools.offsetWidth;
  const navW = navIntrinsicWidth(
    header,
    nav instanceof HTMLElement ? nav : null
  );

  const withoutNav = brandW + groupW + toolsW + 2 * gap + pad;
  const withNav =
    navW > 0
      ? brandW + navW + groupW + toolsW + 3 * gap + pad
      : withoutNav;

  return { available, withNav, withoutNav };
}

/**
 * @param {number} required
 * @param {number} available
 * @param {boolean} currentlyOn
 */
function stageOn(required, available, currentlyOn) {
  const enter = required > available + SLACK_ENTER;
  const exit = required > available - SLACK_EXIT;
  return currentlyOn ? exit : enter;
}

/** @param {HTMLElement} header */
export function syncHeaderMetricsWrap(header) {
  if (!header?.classList) {
    return;
  }
  if (!header.querySelector('.selenoid-header-group')) {
    header.classList.remove(NAV_FOLD, WRAP);
    return;
  }

  const m = measure(header);
  if (!m) {
    return;
  }

  const foldNow = header.classList.contains(NAV_FOLD);
  const wrapNow = header.classList.contains(WRAP);

  /* Fold nav when brand+nav+metrics+tools overflow. */
  const foldNext = stageOn(m.withNav, m.available, foldNow);
  if (foldNow !== foldNext) {
    header.classList.toggle(NAV_FOLD, foldNext);
  }

  /*
   * Remeasure after fold is applied. Showing the burger (display:none →
   * inline-flex) does not change `.header__inner` box size, so ResizeObserver
   * alone never re-runs — wrap would stay off while brand+tiles+burger
   * overflow (Responsive Design Mode / cold load at phone width).
   */
  const mWrap = foldNext ? measure(header) ?? m : m;
  const wrapNext =
    foldNext && stageOn(mWrap.withoutNav, mWrap.available, wrapNow);

  if (wrapNow !== wrapNext) {
    header.classList.toggle(WRAP, wrapNext);
  }
}

/** @param {HTMLElement} header */
function scheduleSync(header) {
  const s = state.get(header) ?? {};
  if (s.raf) {
    return;
  }
  s.raf = requestAnimationFrame(() => {
    s.raf = 0;
    state.set(header, s);
    syncHeaderMetricsWrap(header);
  });
  state.set(header, s);
}

/** @param {HTMLElement} header */
export function observeHeaderMetricsWrap(header) {
  if (!header) {
    return;
  }
  if (state.get(header)?.ro) {
    syncHeaderMetricsWrap(header);
    return;
  }

  syncHeaderMetricsWrap(header);

  /** @type {{ ro?: ResizeObserver, mo?: MutationObserver, raf?: number, navW?: number }} */
  const s = state.get(header) ?? {};
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      scheduleSync(header);
    });
    const inner = header.querySelector('.header__inner');
    if (inner) {
      ro.observe(inner);
    }
    ro.observe(header);
    s.ro = ro;
  }

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      scheduleSync(header);
    });
    const slot = header.querySelector('[data-testid="header-slot"]');
    mo.observe(slot ?? header, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    s.mo = mo;
  }

  state.set(header, s);
}

/**
 * @param {ParentNode | null | undefined} root
 */
export function initHeaderMetricsWrap(root) {
  const scope = root && 'querySelector' in root ? root : document;
  const header =
    scope.querySelector?.('.header:has(.selenoid-header-group)') ??
    scope.querySelector?.('.header');
  if (header instanceof HTMLElement) {
    observeHeaderMetricsWrap(header);
  }
}
