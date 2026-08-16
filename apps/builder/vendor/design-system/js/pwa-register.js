/**
 * PWA register primitive (SSOT).
 *
 * Heirs (selenoid-ui, allure-notifications builder, autotests-ai-multistack-app / stacks)
 * generate `sw.js` on their own build, but **must** register through this
 * module — no local bare `navigator.serviceWorker.register` copies.
 *
 * Semantics match vite-plugin-pwa `registerType: 'autoUpdate'` +
 * `registerSW({ immediate: true })`: register ASAP, call `update()`, reload
 * on `controllerchange` when an *existing* controller is replaced (new shell).
 * First claim (no prior controller) must not reload — otherwise every fresh
 * mount / cross-scope navigation blinks twice (claim → reload → paint).
 *
 * Preview / local HTTP stands should not call this (no SW on DS preview).
 *
 * @typedef {{
 *   swUrl?: string,
 *   immediate?: boolean,
 *   reloadOnControllerChange?: boolean,
 *   onRegistered?: (reg: ServiceWorkerRegistration) => void,
 *   onRegisterError?: (err: unknown) => void,
 * }} RegisterServiceWorkerOptions
 */

/** @type {string} */
export const DEFAULT_SW_URL = '/sw.js';

/**
 * Icon paths heirs put in `manifest.webmanifest` + precache.
 * Brand art is per-product; replace files (or reinstall the PWA) when art changes.
 *
 * @type {readonly string[]}
 */
export const PWA_ICON_PATHS = Object.freeze([
  'icons/pwa-192.png',
  'icons/pwa-512.png',
  'icons/pwa-maskable-512.png',
]);

/**
 * Contract the heir-generated service worker must satisfy.
 * VitePWA `registerType: 'autoUpdate'` + `cleanupOutdatedCaches` covers this;
 * static heirs (ANB) must emit the same flags in their Workbox/SW build.
 *
 * @type {Readonly<{
 *   registerType: 'autoUpdate',
 *   skipWaiting: true,
 *   clientsClaim: true,
 *   cleanupOutdatedCaches: true,
 *   navigateFallback: 'index.html',
 * }>}
 */
export const PWA_SW_CONTRACT = Object.freeze({
  registerType: 'autoUpdate',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  navigateFallback: 'index.html',
});

/**
 * @param {RegisterServiceWorkerOptions} [options]
 * @returns {void}
 */
export function registerServiceWorker(options = {}) {
  const {
    swUrl = DEFAULT_SW_URL,
    immediate = true,
    reloadOnControllerChange = true,
    onRegistered,
    onRegisterError,
  } = options;

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (reloadOnControllerChange) {
    // Capture before register(): first clientsClaim also fires controllerchange.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    });
  }

  const run = () => {
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        if (typeof reg.update === 'function') {
          reg.update().catch(() => {});
        }
        if (typeof onRegistered === 'function') {
          onRegistered(reg);
        }
      })
      .catch((err) => {
        console.warn('service worker registration failed', err);
        if (typeof onRegisterError === 'function') {
          onRegisterError(err);
        }
      });
  };

  if (immediate) {
    run();
    return;
  }

  window.addEventListener('load', run);
}
