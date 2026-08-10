/** SSOT mock rows for kit `testsTable` — palette micro + canvas height-fill. */
export const TESTS_TABLE_MOCK_ROWS = [
    {
        name: 'shouldLogin…',
        paletteName: 'login',
        title: 'auth.LoginTests.shouldLoginWithValidCredentials',
        status: 'passed',
        trendPoints: '2,9 8,7 14,6 20,8 26,5 32,6 38,4',
        flakyFlips: 0,
        stability: ['passed', 'passed', 'passed', 'passed', 'passed'],
    },
    {
        name: 'shouldReject…',
        paletteName: 'reject',
        title: 'auth.LoginTests.shouldRejectInvalidPassword',
        status: 'passed',
        trendPoints: '2,4 8,6 14,5 20,7 26,5 32,6 38,5',
        flakyFlips: 2,
        stability: ['failed', 'passed', 'failed', 'passed', 'passed'],
    },
    {
        name: 'checkoutFlow…',
        paletteName: 'checkout',
        title: 'e2e.CheckoutTests.checkoutFlowCompletes',
        status: 'failed',
        trendPoints: '2,6 8,5 14,4 20,6 26,7 32,8 38,9',
        trendStroke: 'var(--color-danger)',
        flakyFlips: 1,
        stability: ['passed', 'passed', 'failed', 'failed'],
    },
    {
        name: 'apiHealth…',
        paletteName: 'api',
        title: 'api.HealthTests.apiHealthReturns200',
        status: 'broken',
        trendPoints: '2,6 8,6 14,7 20,6 26,6 32,6 38,6',
        trendStroke: 'var(--color-warning)',
        flakyFlips: 0,
        stability: ['passed', 'broken'],
    },
    {
        name: 'legacyImport…',
        paletteName: 'legacy',
        title: 'unit.LegacyTests.legacyImportSkipped',
        status: 'skipped',
        trendPoints: '2,6 8,6 14,6 20,6 26,6 32,6 38,6',
        trendStroke: 'var(--color-text-muted)',
        flakyFlips: 0,
        stability: ['skipped'],
    },
];
function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function sparklineMockSvg(points, stroke = 'var(--color-info)') {
    const areaPoints = `2,12 ${points} 38,12`;
    return (`<svg class="sparkline sparkline--duration" viewBox="0 0 40 12" width="40" height="12" aria-hidden="true">` +
        `<polygon class="sparkline__area" points="${areaPoints}" fill="${stroke}" fill-opacity="0.14"/>` +
        `<polyline class="sparkline__line" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>` +
        `</svg>`);
}
function stabilityDotsHtml(statuses, limit) {
    const slice = limit ? statuses.slice(0, limit) : statuses;
    return slice
        .map((status) => `<span class="stability-dot stability-dot--${escapeHtml(status)}"></span>`)
        .join('');
}
function stabilityCellHtml(flakyFlips, statuses, palette = false) {
    const badge = flakyFlips > 0 && !palette
        ? `<span class="badge badge--flaky" title="Flaky flips: ${flakyFlips}">${flakyFlips}</span>`
        : '';
    const dots = stabilityDotsHtml(statuses, palette ? 4 : undefined);
    return (`<div class="stability-cell">${badge}` +
        `<span class="stability-dots" aria-hidden="true">${dots}</span>` +
        `</div>`);
}
/** Canvas / TG kit mock row — badge status + optional flaky badge. */
export function renderTestsTableCanvasRow(row, opts) {
    const name = opts?.name ?? row.name;
    const title = opts?.title ?? row.title;
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    return (`<tr>` +
        `<td class="tests-table-panel__name"${titleAttr}>${escapeHtml(name)}</td>` +
        `<td class="tests-table-panel__status"><span class="badge badge--status-${row.status}">${row.status}</span></td>` +
        `<td class="tests-table-panel__trend">${sparklineMockSvg(row.trendPoints, row.trendStroke)}</td>` +
        `<td class="tests-table-panel__stability">${stabilityCellHtml(row.flakyFlips, row.stability)}</td>` +
        `</tr>`);
}
/** Palette 2×2 micro row — indicator status, stability capped at 4 dots. */
export function renderTestsTablePaletteRow(row) {
    return (`<tr>` +
        `<td class="tests-table-panel__name">${escapeHtml(row.paletteName)}</td>` +
        `<td class="tests-table-panel__status"><span class="indicator indicator--${row.status} indicator--solid" aria-hidden="true"></span></td>` +
        `<td class="tests-table-panel__trend">${sparklineMockSvg(row.trendPoints, row.trendStroke)}</td>` +
        `<td class="tests-table-panel__stability">${stabilityCellHtml(row.flakyFlips, row.stability, true)}</td>` +
        `</tr>`);
}
/** Canvas tbody rows — height-sliced from pool (cycle `#2`/`#3`… when taller tile). */
export function canvasTestsTableRowsHtml(count = TESTS_TABLE_MOCK_ROWS.length) {
    const n = Math.max(0, Math.floor(count));
    const parts = [];
    for (let i = 0; i < n; i += 1) {
        const base = TESTS_TABLE_MOCK_ROWS[i % TESTS_TABLE_MOCK_ROWS.length];
        const cycle = Math.floor(i / TESTS_TABLE_MOCK_ROWS.length);
        if (cycle === 0) {
            parts.push(renderTestsTableCanvasRow(base));
            continue;
        }
        const suffix = `#${cycle + 1}`;
        parts.push(renderTestsTableCanvasRow(base, {
            name: `${base.name}${suffix}`,
            title: base.title ? `${base.title}${suffix}` : undefined,
        }));
    }
    return parts.join('');
}
/** Palette thumb — fixed 5 micro rows. */
export function paletteTestsTableRowsHtml() {
    return TESTS_TABLE_MOCK_ROWS.map((row) => renderTestsTablePaletteRow(row)).join('');
}
