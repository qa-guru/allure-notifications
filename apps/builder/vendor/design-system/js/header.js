import { syncThemeToggleIcon } from './theme-icons.js';
import { fetchTemplateText } from './dom-utils.js';
import { observeHeaderMetricsWrap } from './header-metrics-wrap.js';

/**
 * Resolve #app-header lazily. In SPA consumers the mount may appear after this
 * module is imported (e.g. selenoid-header-bridge in <head> before React);
 * a top-level throw would poison the ES module cache for the whole session.
 */
function getMount() {
  return document.getElementById('app-header');
}

const TEMPLATE_URLS = [
  new URL('../templates/header.html', import.meta.url),
];

/**
 * @typedef {{ href?: string, label?: string }} HeaderBrandLeadingConfig
 * @typedef {{ href?: string, leading?: HeaderBrandLeadingConfig }} HeaderBrandConfig
 * @typedef {{ href: string, label: string, active?: boolean, testid?: string, match?: 'path' | 'host' }} HeaderNavItem
 * @typedef {{ default?: 'ru' | 'en' }} HeaderLangConfig
 * @typedef {{ default?: 'dark' | 'light' }} HeaderThemeConfig
 * @typedef {{ href?: string, label?: string, hidden?: boolean, iconSrc?: string }} HeaderToolLinkConfig
 * @typedef {{ github?: HeaderToolLinkConfig, githubPages?: HeaderToolLinkConfig }} HeaderToolsConfig
 * @typedef {{ brand?: HeaderBrandConfig, nav?: HeaderNavItem[], lang?: HeaderLangConfig, theme?: HeaderThemeConfig, tools?: HeaderToolsConfig }} HeaderConfig
 */

export const HEADER_LANG_CHANGE = 'header:lang-change';

/**
 * Keyboard vs pointer focus — SSOT with css/tokens.css
 * `html[data-keyboard-intent]`. Rings stay off until Tab/Arrow; a click
 * never leaves the UA / :focus-visible box on chrome controls.
 */
function installKeyboardFocusIntent() {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  if (root.dataset.focusIntentReady) {
    return;
  }
  root.dataset.focusIntentReady = 'true';
  const pointer = () => {
    root.removeAttribute('data-keyboard-intent');
  };
  const keyboard = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
      root.setAttribute('data-keyboard-intent', '');
    }
  };
  window.addEventListener('pointerdown', pointer, true);
  window.addEventListener('keydown', keyboard, true);
}

if (typeof window !== 'undefined') {
  window.HEADER_LANG_CHANGE = HEADER_LANG_CHANGE;
  installKeyboardFocusIntent();
}

/** @type {HeaderConfig} */
export const DEFAULT_HEADER_CONFIG = {
  brand: {
    href: 'https://qa.guru/',
  },
  nav: [
    {
      href: 'https://qa.guru/',
      label: 'Главная',
      active: true,
      testid: 'header-nav-home',
    },
    {
      href: '#',
      label: 'Курсы',
      testid: 'header-nav-courses',
    },
    {
      href: 'https://qa.guru/about',
      label: 'О школе',
      testid: 'header-nav-about',
    },
  ],
  lang: {
    default: 'en',
  },
  theme: {
    default: 'light',
  },
};

/** @param {HeaderConfig | undefined} override @returns {HeaderConfig} */
function resolveHeaderConfig(override) {
  if (!override) {
    return DEFAULT_HEADER_CONFIG;
  }
  return {
    ...DEFAULT_HEADER_CONFIG,
    ...override,
    brand: {
      ...DEFAULT_HEADER_CONFIG.brand,
      ...override.brand,
      leading:
        override.brand?.leading === undefined
          ? DEFAULT_HEADER_CONFIG.brand?.leading
          : override.brand.leading,
    },
    lang: {
      ...DEFAULT_HEADER_CONFIG.lang,
      ...override.lang,
    },
    theme: {
      ...DEFAULT_HEADER_CONFIG.theme,
      ...override.theme,
    },
    nav: override.nav ?? DEFAULT_HEADER_CONFIG.nav,
    tools: override.tools,
  };
}

/**
 * Normalize a pathname for route comparison: drop a trailing slash except for
 * the root, so `/login/` and `/login` match while `/` stays exact.
 * @param {string | null | undefined} pathname @returns {string}
 */
function normalizePathname(pathname) {
  if (!pathname) {
    return '/';
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }
  return pathname;
}

/**
 * Resolve a nav href to a same-origin pathname, or null when it is not a local
 * route (external URL, `#`-anchor, empty). Lets nav items be matched against
 * the current URL instead of trusting a hardcoded `active` flag.
 * @param {string | null | undefined} href @returns {string | null}
 */
function hrefToPathname(href) {
  if (!href || href.startsWith('#')) {
    return null;
  }
  let url;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) {
    return null;
  }
  return normalizePathname(url.pathname);
}

/**
 * Env switcher (`match: 'host'`): keep the configured env home (origin + `/`),
 * highlight by hostname, without participating in exclusive page-nav active.
 * Do not copy the current path — Stage/Prod are stand roots, not page twins.
 * @param {HTMLAnchorElement} link
 */
function syncHostMatchLink(link) {
  let url;
  try {
    url = new URL(link.getAttribute('href') || '', window.location.origin);
  } catch {
    return;
  }
  const isCurrentHost = url.hostname === window.location.hostname;
  link.classList.toggle('is-active', isCurrentHost);
  if (isCurrentHost) {
    link.setAttribute('aria-current', 'true');
  } else {
    link.removeAttribute('aria-current');
  }
}

/**
 * Recompute is-active / aria-current on the rendered nav from the current URL.
 * Exactly one path-matched link is ever marked `aria-current="page"`. Falls back
 * to the config-declared active item (data-header-active) only when no nav href
 * matches the current route. Host-match items (env switchers) keep their
 * configured origin and are highlighted separately. Syncs inline nav and mobile menu.
 * @param {ParentNode} root
 */
function syncActiveNav(root) {
  const nav = root.querySelector('[data-testid="header-nav"]');
  const menuNav = root.querySelector('[data-testid="header-menu-nav"]');
  const linkSets = [
    nav ? Array.from(nav.querySelectorAll('a')) : [],
    menuNav ? Array.from(menuNav.querySelectorAll('a')) : [],
  ];
  const links = /** @type {HTMLAnchorElement[]} */ (linkSets.flat());
  if (links.length === 0) {
    return;
  }

  const pathLinks = links.filter((link) => link.dataset.headerMatch !== 'host');
  const hostLinks = links.filter((link) => link.dataset.headerMatch === 'host');

  const current = normalizePathname(window.location.pathname);
  const routeHref = pathLinks
    .find((link) => hrefToPathname(link.getAttribute('href')) === current)
    ?.getAttribute('href');
  const fallbackHref = pathLinks
    .find((link) => link.dataset.headerActive === 'true')
    ?.getAttribute('href');
  const activeHref = routeHref ?? fallbackHref ?? null;

  for (const link of pathLinks) {
    const isActive =
      activeHref !== null && link.getAttribute('href') === activeHref;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  for (const link of hostLinks) {
    syncHostMatchLink(link);
  }
}

/** @param {ParentNode} root @param {HeaderConfig} config */
function applyHeaderConfig(root, config) {
  const brandLink = root.querySelector('[data-testid="header-brand-link"]');
  if (brandLink && config.brand?.href) {
    brandLink.href = config.brand.href;
  }

  const leadingLink = root.querySelector('[data-testid="header-brand-leading"]');
  if (leadingLink instanceof HTMLAnchorElement) {
    const leading = config.brand?.leading;
    if (leading) {
      leadingLink.hidden = false;
      leadingLink.href = leading.href ?? '#';
      leadingLink.setAttribute('aria-label', leading.label ?? 'Selenoid 3');
    } else {
      leadingLink.hidden = true;
    }
  }

  const nav = root.querySelector('[data-testid="header-nav"]');
  if (!nav || !Array.isArray(config.nav)) {
    return;
  }

  nav.replaceChildren(
    ...config.nav.flatMap((item, index) => {
      const divider = document.createElement('span');
      divider.className = 'plaque-divider';
      divider.setAttribute('aria-hidden', 'true');

      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      link.className = 'link link--nav';
      link.dataset.testid = item.testid ?? `header-nav-${index}`;
      if (item.active) {
        link.dataset.headerActive = 'true';
      }
      if (item.match === 'host') {
        link.dataset.headerMatch = 'host';
      }
      return [divider, link];
    })
  );

  // Highlight is derived from the real route (not the static config flag) so
  // direct URLs, top-nav clicks and in-form links stay in sync — including SPA
  // pushState navigation observed via observeNavigation().
  syncActiveNav(root);
}

/** @param {ParentNode} root @param {HeaderToolsConfig | undefined} tools */
function applyHeaderTools(root, tools) {
  if (!tools) {
    return;
  }
  /** @type {[keyof HeaderToolsConfig, string][]} */
  const entries = [
    ['github', 'header-github'],
    ['githubPages', 'header-github-pages'],
  ];
  for (const [key, testid] of entries) {
    const cfg = tools[key];
    if (!cfg) {
      continue;
    }
    const el = root.querySelector(`[data-testid="${testid}"]`);
    if (!(el instanceof HTMLAnchorElement)) {
      continue;
    }
    if (cfg.hidden) {
      el.hidden = true;
      continue;
    }
    if (cfg.href) {
      el.href = cfg.href;
    }
    if (cfg.label) {
      el.setAttribute('aria-label', cfg.label);
    }
    if (cfg.iconSrc) {
      const wrap = el.querySelector('.icon');
      if (wrap instanceof HTMLElement) {
        wrap.innerHTML = `<img src="${cfg.iconSrc}" alt="" width="18" height="18" decoding="async" />`;
      }
    }
  }
}

/** @param {ParentNode} root @param {HeaderConfig} config */
function buildHeaderMenu(root, config) {
  const menu = root.querySelector('[data-testid="header-menu"]');
  if (!menu) {
    return;
  }

  menu.replaceChildren();

  if (Array.isArray(config.nav) && config.nav.length > 0) {
    const menuNav = document.createElement('nav');
    menuNav.className = 'header__menu-nav';
    menuNav.dataset.testid = 'header-menu-nav';
    menuNav.setAttribute('aria-label', 'Mobile navigation');
    menuNav.replaceChildren(
      ...config.nav.map((item, index) => {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        link.className = 'link link--nav';
        link.dataset.testid = `header-menu-nav-${item.testid?.replace(/^header-nav-/, '') ?? index}`;
        if (item.active) {
          link.dataset.headerActive = 'true';
        }
        if (item.match === 'host') {
          link.dataset.headerMatch = 'host';
        }
        return link;
      })
    );
    menu.appendChild(menuNav);
  }

  const menuSearch = document.createElement('div');
  menuSearch.className = 'header__menu-search';
  menuSearch.dataset.testid = 'header-menu-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.id = 'header-menu-search-input';
  searchInput.name = 'header-menu-search';
  searchInput.className = 'input';
  searchInput.placeholder = 'Поиск';
  searchInput.autocomplete = 'off';
  searchInput.dataset.testid = 'header-menu-search-input';
  searchInput.setAttribute('aria-label', 'Поиск');
  menuSearch.appendChild(searchInput);
  menu.appendChild(menuSearch);

  const menuTools = document.createElement('div');
  menuTools.className = 'header__menu-tools';
  menuTools.dataset.testid = 'header-menu-tools';

  const langToggle = root.querySelector('.header__tools .lang-toggle');
  if (langToggle) {
    const menuLang = /** @type {HTMLElement} */ (langToggle.cloneNode(true));
    const menuLangBtn = menuLang.querySelector('[data-testid="header-lang-toggle"]');
    const menuLangLabel = menuLang.querySelector('[data-testid="header-lang-label"]');
    if (menuLangBtn instanceof HTMLElement) {
      menuLangBtn.dataset.testid = 'header-menu-lang-toggle';
    }
    if (menuLangLabel instanceof HTMLElement) {
      menuLangLabel.dataset.testid = 'header-menu-lang-label';
    }
    menuTools.appendChild(menuLang);
  }

  const themeSource = root.querySelector('[data-testid="header-theme-toggle"]');
  if (themeSource instanceof HTMLElement) {
    const menuTheme = /** @type {HTMLElement} */ (themeSource.cloneNode(true));
    menuTheme.dataset.testid = 'header-menu-theme-toggle';
    menuTools.appendChild(menuTheme);
  }

  for (const testid of ['header-github', 'header-github-pages']) {
    const source = root.querySelector(`[data-testid="${testid}"]`);
    if (!source || !(source instanceof HTMLAnchorElement)) {
      continue;
    }
    const link = document.createElement('a');
    link.href = source.href;
    link.className = 'icon-btn';
    link.dataset.testid = testid.replace('header-', 'header-menu-');
    link.setAttribute('aria-label', source.getAttribute('aria-label') ?? '');
    link.target = source.target;
    link.rel = source.rel;
    const icon = source.querySelector('.icon');
    if (icon) {
      link.innerHTML = icon.outerHTML;
    }
    menuTools.appendChild(link);
  }

  if (menuTools.childElementCount > 0) {
    menu.appendChild(menuTools);
  }

  syncActiveNav(root);
}

/** @param {HTMLElement} menu @param {HTMLElement} burger @param {boolean} open */
function setHeaderMenuOpen(menu, burger, open) {
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/** @param {ParentNode} root */
function closeHeaderMenu(root) {
  const menu = root.querySelector('[data-testid="header-menu"]');
  const burger = root.querySelector('[data-testid="header-burger"]');
  if (menu instanceof HTMLElement && burger instanceof HTMLElement) {
    setHeaderMenuOpen(menu, burger, false);
  }
}

/** @param {ParentNode} root */
function bindHeaderMenu(root) {
  const menu = root.querySelector('[data-testid="header-menu"]');
  const burger = root.querySelector('[data-testid="header-burger"]');
  if (!(menu instanceof HTMLElement) || !(burger instanceof HTMLElement)) {
    return;
  }

  if (typeof window.getComputedStyle !== 'function') {
    return;
  }

  // The burger drives the menu whenever it is visible. Its breakpoint lives in
  // CSS (≤768 on the default header, ≤1120 on the metrics/selenoid header), so
  // we read the computed display here instead of hardcoding a matchMedia width.
  const isBurgerVisible = () =>
    window.getComputedStyle(burger).display !== 'none';

  burger.addEventListener('click', () => {
    if (!isBurgerVisible()) {
      return;
    }
    const open = menu.hidden;
    setHeaderMenuOpen(menu, burger, open);
  });

  menu.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a')) {
      closeHeaderMenu(root);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeHeaderMenu(root);
    }
  });

  document.addEventListener('click', (event) => {
    if (menu.hidden) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    const header = root.querySelector('[data-testid="header"]');
    if (header && !header.contains(target)) {
      closeHeaderMenu(root);
    }
  });

  const onViewportChange = () => {
    if (!isBurgerVisible()) {
      closeHeaderMenu(root);
    }
  };
  window.addEventListener('resize', onViewportChange);
}

/** @param {'ru' | 'en'} lang */
function dispatchLangChange(lang) {
  document.dispatchEvent(
    new CustomEvent(HEADER_LANG_CHANGE, { detail: { lang } })
  );
}

/** @param {HTMLElement} langBtn @param {HTMLElement} langLabel @param {'ru' | 'en'} lang */
function setLangState(langBtn, langLabel, lang) {
  const code = lang === 'en' ? 'en' : 'ru';
  langBtn.dataset.lang = code;
  langLabel.textContent = code === 'ru' ? 'RU' : 'EN';
  langBtn.setAttribute(
    'aria-label',
    code === 'ru' ? 'Переключить на English' : 'Switch to Russian'
  );
}

/** @param {ParentNode} root @param {'ru' | 'en'} lang */
function syncAllLangToggles(root, lang) {
  for (const wrap of root.querySelectorAll('.lang-toggle')) {
    const btn = wrap.querySelector('button');
    const label = wrap.querySelector('.lang-toggle__label');
    if (btn instanceof HTMLElement && label instanceof HTMLElement) {
      setLangState(btn, label, lang);
    }
  }
}

/** @param {ParentNode} root @param {HeaderLangConfig | undefined} langConfig */
function applyLangDefault(root, langConfig) {
  const code = langConfig?.default === 'ru' ? 'ru' : 'en';
  syncAllLangToggles(root, code);
  dispatchLangChange(code);
}

/** @param {HTMLElement} themeBtn */
function setThemeIcon(themeBtn) {
  syncThemeToggleIcon(themeBtn);
}

/** @param {HeaderThemeConfig | undefined} themeConfig */
function applyThemeDefault(themeConfig) {
  const isLight = themeConfig?.default !== 'dark';
  document.documentElement.classList.toggle('theme-light', isLight);
}

async function fetchHeaderTemplate() {
  for (const url of TEMPLATE_URLS) {
    try {
      return await fetchTemplateText(url);
    } catch {
      continue;
    }
  }
  throw new Error('header.js: failed to load template (404 on all candidate paths)');
}

async function mountHeader() {
  const mount = getMount();
  if (!mount) {
    return;
  }

  mount.innerHTML = await fetchHeaderTemplate();

  const config = resolveHeaderConfig(window.headerConfig);
  applyHeaderConfig(mount, config);
  applyHeaderTools(mount, config.tools);
  buildHeaderMenu(mount, config);
  applyLangDefault(mount, config.lang);
  applyThemeDefault(config.theme);

  for (const themeBtn of mount.querySelectorAll(
    '[data-testid="header-theme-toggle"], [data-testid="header-menu-theme-toggle"]'
  )) {
    if (themeBtn instanceof HTMLElement) {
      setThemeIcon(themeBtn);
    }
  }

  bindHeaderControls(mount);
  bindHeaderMenu(mount);

  const headerEl = mount.querySelector('.header');
  if (headerEl instanceof HTMLElement) {
    observeHeaderMetricsWrap(headerEl);
  }
}

function bindHeaderControls(root) {
  for (const langBtn of root.querySelectorAll(
    '[data-testid="header-lang-toggle"], [data-testid="header-menu-lang-toggle"]'
  )) {
    langBtn.addEventListener('click', () => {
      if (!(langBtn instanceof HTMLElement)) {
        return;
      }
      const next = langBtn.dataset.lang === 'ru' ? 'en' : 'ru';
      syncAllLangToggles(root, next);
      dispatchLangChange(next);
    });
  }

  const themeBtns = [
    ...root.querySelectorAll(
      '[data-testid="header-theme-toggle"], [data-testid="header-menu-theme-toggle"]'
    ),
  ].filter((el) => el instanceof HTMLElement);

  for (const themeBtn of themeBtns) {
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('theme-light');
      for (const btn of themeBtns) {
        setThemeIcon(btn);
      }
    });
  }
}

/** Re-read `window.headerConfig` and remount #app-header (playground live sync). */
export async function remountHeader() {
  await mountHeader();
}

// Self-register so SPA remount works when the bridge races React, or when
// AppHeader injects this module after #app-header already exists.
if (typeof window !== 'undefined') {
  window.__designSystemRemountHeader = remountHeader;
}

/**
 * Keep the active nav item in sync with client-side navigation. Browsers fire
 * `popstate` only for back/forward, not for `history.pushState`/`replaceState`
 * used by SPA routers (e.g. React Router `<Link>`), so those are wrapped once
 * to emit a synthetic `header:locationchange`. Registered once at module load;
 * listeners re-read the live DOM, so they survive remountHeader().
 */
function observeNavigation() {
  if (typeof window === 'undefined') {
    return;
  }
  const resync = () => {
    const mount = getMount();
    if (mount) {
      syncActiveNav(mount);
    }
  };
  window.addEventListener('popstate', resync);
  window.addEventListener('header:locationchange', resync);

  if (window.__headerNavPatched) {
    return;
  }
  window.__headerNavPatched = true;
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];
    if (typeof original !== 'function') {
      continue;
    }
    history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event('header:locationchange'));
      return result;
    };
  }
}

observeNavigation();
mountHeader();
