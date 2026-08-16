import { PHRASES } from './phrases.js';
import { getPath, state } from './state.js';
export const TG_BOT_NAME = 'Test Notifications Bot';
export const TG_PREVIEW_STATS = Object.freeze({
    // Mixed statuses so telegram.ftl-parity caption lines stay exercised in preview.
    total: 9,
    passed: 5,
    failed: 1,
    broken: 1,
    unknown: 1,
    skipped: 1,
    durationMs: 56205,
});
/** Test override — null uses TG_PREVIEW_STATS. */
let tgPreviewStatsOverride = null;
/** Fallback links when Options → links are empty (Multistack dogfood). */
export const TG_PREVIEW_LINKS = Object.freeze({
    report: 'https://reports.autotests.ai/reports/latest/awesome/index.html',
    dashboard: 'https://reports.autotests.ai/reports/latest/dashboard/index.html',
    testops: 'https://allure.qa.guru/launch/54543',
    build: 'https://github.com/autotests-ai/autotests-ai-multistack-app/actions/runs/29798732034',
});
export const TG_LINK_KEYS = Object.freeze(['report', 'dashboard', 'testops', 'build']);
/**
 * @param {number} n
 */
export function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/**
 * @param {string} lang
 */
export function phrasesFor(lang) {
    return PHRASES[(lang in PHRASES ? lang : 'en')];
}
/**
 * @param {number} ms
 */
export function formatDurationMs(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const frac = ms % 1000;
    return (`${String(h).padStart(2, '0')}:` +
        `${String(m).padStart(2, '0')}:` +
        `${String(s).padStart(2, '0')}.` +
        `${String(frac).padStart(3, '0')}`);
}
/**
 * @param {number} input
 * @param {number} total
 */
export function formatPercentage(input, total) {
    if (!total || !input)
        return '';
    const pct = Math.round((input * 1000) / total) / 10;
    const text = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
    return ` (${text} %)`;
}
/** Mirrors jar `/templates/telegram.ftl` + `utils.ftl` (preview stats are fixed). */
export function buildTgCaptionHtml() {
    const base = /** @type {{
      environment: string,
      comment: string,
      language: string,
      links: Record<string, string>,
    }} */ (state.base);
    const phrases = phrasesFor(base.language || 'en');
    const env = base.environment ?? '';
    const comment = base.comment ?? '';
    const stats = tgPreviewStatsOverride ?? TG_PREVIEW_STATS;
    const time = formatDurationMs(stats.durationMs);
    const links = base.links || {};
    /** @type {string[]} */
    const lines = [
        `<b>${escapeHtml(phrases.results)}:</b>`,
        `<b>${escapeHtml(phrases.environment)}:</b> ${escapeHtml(env)}`,
        `<b>${escapeHtml(phrases.comment)}:</b> ${escapeHtml(comment)}`,
        `<b>${escapeHtml(phrases.scenario.duration)}:</b> ${escapeHtml(time)}`,
        `<b>${escapeHtml(phrases.scenario.totalScenarios)}:</b> ${stats.total}`,
    ];
    if (stats.passed !== 0) {
        lines.push(`<b>${escapeHtml(phrases.scenario.totalPassed)}:</b> ${stats.passed}${formatPercentage(stats.passed, stats.total)}`);
    }
    if (stats.failed !== 0) {
        lines.push(`<b>${escapeHtml(phrases.scenario.totalFailed)}:</b> ${stats.failed}${formatPercentage(stats.failed, stats.total)}`);
    }
    if (stats.broken !== 0) {
        lines.push(`<b>${escapeHtml(phrases.scenario.totalBroken)}:</b> ${stats.broken}`);
    }
    if (stats.unknown !== 0) {
        lines.push(`<b>${escapeHtml(phrases.scenario.totalUnknown)}:</b> ${stats.unknown}`);
    }
    if (stats.skipped !== 0) {
        lines.push(`<b>${escapeHtml(phrases.scenario.totalSkipped)}:</b> ${stats.skipped}`);
    }
    TG_LINK_KEYS.forEach((key) => {
        // TG_PREVIEW_LINKS always supplies a non-empty fallback for every key.
        const url = links[key] || TG_PREVIEW_LINKS[key];
        const label = phrases.links[key];
        lines.push(`<b>${escapeHtml(label)}:</b> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`);
    });
    return lines.join('\n');
}
export function setTgPreviewStatsForTest(stats) {
    tgPreviewStatsOverride = stats;
}
