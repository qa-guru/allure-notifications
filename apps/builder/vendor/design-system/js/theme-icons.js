export const THEME_ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="4"/>' +
  '<path d="M12 2v2"/><path d="M12 20v2"/>' +
  '<path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/>' +
  '<path d="M2 12h2"/><path d="M20 12h2"/>' +
  '<path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>' +
  '</svg>';

export const THEME_ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>' +
  '</svg>';

/** @param {HTMLElement | null | undefined} themeBtn */
export function syncThemeToggleIcon(themeBtn) {
  if (!themeBtn) {
    return;
  }
  const icon = themeBtn.querySelector('.icon');
  if (!icon) {
    return;
  }
  const isLight = document.documentElement.classList.contains('theme-light');
  icon.innerHTML = isLight ? THEME_ICON_SUN : THEME_ICON_MOON;
  themeBtn.setAttribute(
    'aria-label',
    isLight ? 'Switch to dark theme' : 'Switch to light theme'
  );
}
