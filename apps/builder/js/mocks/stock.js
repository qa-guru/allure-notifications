/**
 * Native Allure 3 (nivo) mocks for `chart.profile: default`.
 * Kit SVG / traffic-light chrome stay on `profile: kit` (WidgetTileMocks).
 * Do not edit vendor/design-system — these overlays live in the builder.
 */
import { normalizeChartProfile } from '@qa-guru/allure-notifications-config';
import { state } from '../state.js';
const FUNNEL_LAYERS = [
    { k: 'manual', n: 2, pct: '5.88%', rate: '100%' },
    { k: 'e2e', n: 3, pct: '8.82%', rate: '66.66%' },
    { k: 'api', n: 4, pct: '11.76%', rate: '75%' },
    { k: 'integration', n: 5, pct: '14.7%', rate: '80%' },
    { k: 'component', n: 8, pct: '23.52%', rate: '87.5%' },
    { k: 'unit', n: 12, pct: '35.29%', rate: '100%' },
];
const DYNAMICS_BARS = [
    { label: '08.08', v: 118 },
    { label: '08.08', v: 92 },
    { label: 'Last', v: 88 },
];
const DURATION_BINS = [
    {
        label: '0–6s',
        segs: [
            { n: 12, fill: 'var(--anb-stock-bar-1)' },
            { n: 5, fill: 'var(--anb-stock-bar-2)' },
            { n: 8, fill: 'var(--anb-stock-bar-3)' },
            { n: 4, fill: 'var(--anb-stock-bar-4)' },
        ],
    },
    { label: '6–12s', segs: [{ n: 1, fill: 'var(--anb-stock-bar-2)' }] },
    { label: '12–19s', segs: [{ n: 2, fill: 'var(--anb-stock-bar-2)' }] },
    { label: '25–31s', segs: [{ n: 2, fill: 'var(--color-info, #61b6fb)' }] },
];
function isKitProfile() {
    const chart = /** @type {{ profile?: string }} */ (state.base.chart);
    return normalizeChartProfile(chart.profile) === 'kit';
}
function tileTier(host) {
    const tile = host.closest('.widget-tile');
    if (!tile)
        return 'regular';
    if (tile.classList.contains('widget-tile--tier-hero'))
        return 'hero';
    if (tile.classList.contains('widget-tile--tier-compact'))
        return 'compact';
    if (tile.classList.contains('widget-tile--tier-micro'))
        return 'micro';
    if (tile.classList.contains('widget-tile--tier-regular'))
        return 'regular';
    return 'regular';
}
function plotBox(host) {
    const base = 240;
    const body = host.classList.contains('widget-tile__body')
        ? host
        : host.closest('.widget-tile__body');
    if (!(body instanceof HTMLElement) || body.clientWidth < 1 || body.clientHeight < 1) {
        return { W: base, H: base };
    }
    const cs = getComputedStyle(body);
    const aw = body.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const ah = body.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    if (aw < 24 || ah < 24)
        return { W: base, H: base };
    let aspect = aw / ah;
    if (aspect > 4)
        aspect = 4;
    else if (aspect < 0.25)
        aspect = 0.25;
    if (aspect >= 1)
        return { W: Math.round(base * aspect), H: base };
    return { W: base, H: Math.round(base / aspect) };
}
function svgOpen(label, kind, W, H) {
    return (`<svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="xMidYMid meet" ` +
        `aria-label="${label}" data-anb-stock="${kind}">`);
}
function vBarPath(x, y, w, h, rTop, rBot) {
    if (w < 0.5 || h < 0.5)
        return '';
    const rt = Math.max(0, Math.min(rTop, w / 2, h / 2));
    const rb = Math.max(0, Math.min(rBot, w / 2, h / 2));
    const x2 = x + w;
    const y2 = y + h;
    let d = `M${(x + rt).toFixed(1)},${y.toFixed(1)}`;
    d += `L${(x2 - rt).toFixed(1)},${y.toFixed(1)}`;
    if (rt > 0)
        d += `A${rt.toFixed(1)},${rt.toFixed(1)} 0 0 1 ${x2.toFixed(1)},${(y + rt).toFixed(1)}`;
    d += `L${x2.toFixed(1)},${(y2 - rb).toFixed(1)}`;
    if (rb > 0)
        d += `A${rb.toFixed(1)},${rb.toFixed(1)} 0 0 1 ${(x2 - rb).toFixed(1)},${y2.toFixed(1)}`;
    d += `L${(x + rb).toFixed(1)},${y2.toFixed(1)}`;
    if (rb > 0)
        d += `A${rb.toFixed(1)},${rb.toFixed(1)} 0 0 1 ${x.toFixed(1)},${(y2 - rb).toFixed(1)}`;
    d += `L${x.toFixed(1)},${(y + rt).toFixed(1)}`;
    if (rt > 0)
        d += `A${rt.toFixed(1)},${rt.toFixed(1)} 0 0 1 ${(x + rt).toFixed(1)},${y.toFixed(1)}`;
    return `${d}Z`;
}
function gridY(x0, x1, y) {
    return (`<line x1="${x0.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y.toFixed(1)}" ` +
        `stroke="var(--color-text-muted)" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="3 3" />`);
}
/** Allure nivo funnel — one purple, trapezoid bands, legend on the left when there is room. */
export function stockPyramidSvg(host) {
    const tier = tileTier(host);
    const box = plotBox(host);
    const W = box.W;
    const H = box.H;
    const n = FUNNEL_LAYERS.length;
    const peak = FUNNEL_LAYERS.reduce((m, l) => Math.max(m, l.n), 1);
    const showLegend = tier !== 'micro' && tier !== 'compact' && W >= 260;
    const legendW = showLegend ? Math.round(W * 0.42) : 0;
    const padX = tier === 'micro' ? 8 : 12;
    const padY = tier === 'micro' ? 6 : 10;
    const gap = Math.max(1.2, H * 0.012);
    const funnelX0 = legendW + padX;
    const funnelW = W - funnelX0 - padX;
    const bandH = (H - padY * 2 - gap * (n - 1)) / n;
    const cx = funnelX0 + funnelW / 2;
    const minFrac = 0.22;
    const widths = FUNNEL_LAYERS.map((l) => funnelW * (minFrac + (1 - minFrac) * (l.n / peak)));
    const parts = [svgOpen('Testing pyramid', 'testingPyramid', W, H)];
    FUNNEL_LAYERS.forEach((layer, i) => {
        const y = padY + i * (bandH + gap);
        const wTop = i === 0 ? widths[0] * 0.72 : (widths[i - 1] + widths[i]) / 2;
        const wBot = i === n - 1 ? widths[i] : (widths[i] + widths[i + 1]) / 2;
        const x0 = cx - wTop / 2;
        const x1 = cx + wTop / 2;
        const x2 = cx + wBot / 2;
        const x3 = cx - wBot / 2;
        const y2 = y + bandH;
        parts.push(`<path d="M${x0.toFixed(1)} ${y.toFixed(1)} L${x1.toFixed(1)} ${y.toFixed(1)} ` +
            `L${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y2.toFixed(1)} Z" ` +
            `fill="var(--anb-stock-funnel)" />`);
        if (showLegend) {
            const ly = y + bandH * 0.38;
            const fs = Math.max(7, Math.round(bandH * 0.28));
            parts.push(`<text x="${padX}" y="${ly.toFixed(1)}" font-family="var(--font-sans)" font-size="${fs}" ` +
                `font-weight="600" fill="var(--color-text)">Layer: ${layer.k}</text>`, `<text x="${padX}" y="${(ly + fs * 1.15).toFixed(1)}" font-family="var(--font-sans)" ` +
                `font-size="${Math.max(6, fs - 1)}" fill="var(--color-text-muted)">` +
                `Number of tests: ${layer.n} (${layer.pct})</text>`, `<text x="${padX}" y="${(ly + fs * 2.25).toFixed(1)}" font-family="var(--font-sans)" ` +
                `font-size="${Math.max(6, fs - 1)}" fill="var(--color-text-muted)">` +
                `Success rate: ${layer.rate}</text>`);
        }
    });
    parts.push('</svg>');
    return parts.join('');
}
/** Allure nivo duration dynamics — vertical bars + dashed grid, not a sparkline. */
export function stockDurationDynamicsSvg(host) {
    const tier = tileTier(host);
    const { W, H } = plotBox(host);
    const showAxis = tier === 'hero' || tier === 'regular';
    const padT = tier === 'micro' ? 6 : 10;
    const padB = showAxis ? 28 : 10;
    const padL = showAxis ? 28 : 8;
    const padR = 8;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const max = 140;
    const n = DYNAMICS_BARS.length;
    const slot = plotW / n;
    const barW = slot * (tier === 'micro' ? 0.5 : 0.38);
    const rx = Math.min(barW / 2, 8);
    const parts = [svgOpen('Duration dynamics', 'durationDynamics', W, H)];
    const ticks = 7;
    for (let i = 0; i <= ticks; i += 1) {
        const y = padT + (i / ticks) * plotH;
        parts.push(gridY(padL, W - padR, y));
    }
    DYNAMICS_BARS.forEach((bar, i) => {
        const bh = (bar.v / max) * plotH;
        const x = padL + i * slot + (slot - barW) / 2;
        const y = padT + plotH - bh;
        const d = vBarPath(x, y, barW, bh, rx, rx);
        if (d) {
            parts.push(`<path d="${d}" fill="var(--anb-stock-dynamics)" />`);
        }
        if (showAxis) {
            parts.push(`<text x="${(x + barW / 2).toFixed(1)}" y="${(H - 8).toFixed(1)}" text-anchor="middle" ` +
                `font-family="var(--font-sans)" font-size="9" fill="var(--color-text-muted)">${bar.label}</text>`);
        }
    });
    if (showAxis) {
        parts.push(`<text x="${padL - 4}" y="${(padT + 4).toFixed(1)}" text-anchor="end" ` +
            `font-family="var(--font-sans)" font-size="8" fill="var(--color-text-muted)">2m</text>`, `<text x="${padL - 4}" y="${(padT + plotH).toFixed(1)}" text-anchor="end" ` +
            `font-family="var(--font-sans)" font-size="8" fill="var(--color-text-muted)">0s</text>`);
    }
    parts.push('</svg>');
    return parts.join('');
}
/** Allure nivo durations — stacked histogram of duration buckets (not layer pills). */
export function stockDurationsHistogramSvg(host) {
    const tier = tileTier(host);
    const { W, H } = plotBox(host);
    const showAxis = tier === 'hero' || tier === 'regular';
    const padT = 8;
    const padB = showAxis ? 26 : 8;
    const padL = showAxis ? 22 : 8;
    const padR = 8;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = DURATION_BINS.length;
    const slot = plotW / n;
    const barW = slot * 0.55;
    const max = 35;
    const rx = 4;
    const parts = [svgOpen('Durations by layer', 'durations', W, H)];
    const ticks = 7;
    for (let i = 0; i <= ticks; i += 1) {
        const y = padT + (i / ticks) * plotH;
        parts.push(gridY(padL, W - padR, y));
    }
    DURATION_BINS.forEach((bin, i) => {
        const x = padL + i * slot + (slot - barW) / 2;
        let y = padT + plotH;
        bin.segs.forEach((seg, si) => {
            const bh = (seg.n / max) * plotH;
            y -= bh;
            const rTop = si === bin.segs.length - 1 ? rx : 0;
            const rBot = si === 0 ? rx : 0;
            const d = vBarPath(x, y, barW, bh, rTop, rBot);
            if (d)
                parts.push(`<path d="${d}" fill="${seg.fill}" />`);
        });
        if (showAxis) {
            parts.push(`<text x="${(x + barW / 2).toFixed(1)}" y="${(H - 8).toFixed(1)}" text-anchor="middle" ` +
                `font-family="var(--font-sans)" font-size="8" fill="var(--color-text-muted)">${bin.label}</text>`);
        }
    });
    parts.push('</svg>');
    return parts.join('');
}
function paintStockTile(tile) {
    if (!(tile instanceof HTMLElement))
        return;
    const kind = (tile.getAttribute('data-chart') || '').trim();
    const groupBy = (tile.getAttribute('data-group-by') || '').trim();
    const body = tile.querySelector('.widget-tile__body');
    if (!(body instanceof HTMLElement))
        return;
    if (kind === 'testingPyramid' || kind === 'pyramid') {
        body.innerHTML = stockPyramidSvg(body);
        body.setAttribute('data-mock-filled', '1');
        return;
    }
    if (kind === 'durationDynamics' || kind === 'duration-trend') {
        body.innerHTML = stockDurationDynamicsSvg(body);
        body.setAttribute('data-mock-filled', '1');
        return;
    }
    if (kind === 'durations' && (groupBy === 'layer' || groupBy === 'label-name:layer')) {
        body.innerHTML = stockDurationsHistogramSvg(body);
        body.setAttribute('data-mock-filled', '1');
    }
}
/** Overlay nivo-shaped SVGs after WidgetTileMocks.fill when profile=default. */
export function applyProfileMocks(scope) {
    if (!scope || isKitProfile())
        return;
    const tiles = scope.querySelectorAll('.widget-tile[data-chart]');
    tiles.forEach(paintStockTile);
}
