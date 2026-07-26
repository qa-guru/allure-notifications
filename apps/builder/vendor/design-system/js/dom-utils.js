/**
 * Shared DOM helpers — SSOT for escapeHtml, template fetch, clipboard.
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string | URL} url
 * @returns {Promise<string>}
 */
export async function fetchTemplateText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('dom-utils: failed to load template ' + url);
  }
  return response.text();
}

/**
 * @param {string} text
 */
function fallbackCopyToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

/**
 * @param {string} text
 * @param {{ onSuccess?: () => void, onError?: () => void, onEmpty?: () => void }} [options]
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text, options) {
  const opts = options || {};
  if (!text) {
    if (opts.onEmpty) {
      opts.onEmpty();
    }
    return false;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopyToClipboard(text);
    }
    if (opts.onSuccess) {
      opts.onSuccess();
    }
    return true;
  } catch (_err) {
    try {
      fallbackCopyToClipboard(text);
      if (opts.onSuccess) {
        opts.onSuccess();
      }
      return true;
    } catch (_fallbackErr) {
      if (opts.onError) {
        opts.onError();
      }
      return false;
    }
  }
}
