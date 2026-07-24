package guru.qa.allure.notifications.chart;

import java.awt.Graphics2D;
import java.awt.geom.Path2D;

/**
 * Rounded-corner helpers for bar-style chart panels, so bars match the canon
 * "rounded" look (kept in sync with the web dashboard-overrides.js bar radius).
 */
final class Bars {

    /** Default corner diameter cap for vertical histogram bars. */
    static final int DEFAULT_ARC = 10;

    private Bars() {
    }

    /**
     * Vertical bar with rounded top corners and a flush (square) bottom, so bars
     * sit cleanly on the baseline while the tops read as rounded.
     */
    static void fillTopRounded(Graphics2D graphics, int x, int y, int width, int height, int maxArc) {
        fillVerticalEnd(graphics, x, y, width, height, maxArc, true, false);
    }

    /**
     * Vertical stacked-bar segment with rounding only on the outer ends of the stack.
     * Middle junctions stay square so adjacent segments meet flush.
     */
    static void fillStackedVertical(Graphics2D graphics, int x, int y, int width, int height,
                                    int maxArc, boolean roundTop, boolean roundBottom) {
        if (width <= 0 || height <= 0) {
            return;
        }
        fillVerticalEnd(graphics, x, y, width, height, maxArc, roundTop, roundBottom);
    }

    /**
     * Vertical bar with rounded bottom corners and a flush (square) top, for the
     * bottom segment of a stacked column.
     */
    static void fillBottomRounded(Graphics2D graphics, int x, int y, int width, int height, int maxArc) {
        fillVerticalEnd(graphics, x, y, width, height, maxArc, false, true);
    }

    private static void fillVerticalEnd(Graphics2D graphics, int x, int y, int width, int height,
                                        int maxArc, boolean roundTop, boolean roundBottom) {
        if (width <= 0 || height <= 0) {
            return;
        }
        int rTop = roundTop ? cornerRadius(maxArc, width, height) : 0;
        int rBot = roundBottom ? cornerRadius(maxArc, width, height) : 0;
        if (rTop == 0 && rBot == 0) {
            graphics.fillRect(x, y, width, height);
            return;
        }
        graphics.fill(verticalBarPath(x, y, width, height, rTop, rBot));
    }

    /** Match widget-tile {@code vBarPath}: clamp radius to half-width/half-height. */
    private static int cornerRadius(int maxArc, int width, int height) {
        return Math.max(0, Math.min(maxArc, Math.min(width / 2, height / 2)));
    }

    /** Vertical bar path with independent top/bottom radii (SVG vBarPath parity). */
    private static Path2D verticalBarPath(int x, int y, int width, int height, int rTop, int rBot) {
        int x2 = x + width;
        int y2 = y + height;
        Path2D path = new Path2D.Float();
        path.moveTo(x + rTop, y);
        path.lineTo(x2 - rTop, y);
        if (rTop > 0) {
            path.quadTo(x2, y, x2, y + rTop);
        }
        path.lineTo(x2, y2 - rBot);
        if (rBot > 0) {
            path.quadTo(x2, y2, x2 - rBot, y2);
        }
        path.lineTo(x + rBot, y2);
        if (rBot > 0) {
            path.quadTo(x, y2, x, y2 - rBot);
        }
        path.lineTo(x, y + rTop);
        if (rTop > 0) {
            path.quadTo(x, y, x + rTop, y);
        }
        path.closePath();
        return path;
    }

    /** Horizontal bar with fully rounded caps (pill), for left-anchored bars. */
    static void fillPill(Graphics2D graphics, int x, int y, int width, int height) {
        if (width <= 0 || height <= 0) {
            return;
        }
        int arc = Math.min(height, width);
        graphics.fillRoundRect(x, y, width, height, arc, arc);
    }

    /**
     * Pixel heights for a vertical stack that must fill {@code plotHeight} exactly.
     * Rounding per-segment with {@code Math.max(1, round(...))} can overshoot and
     * push the top segment above the plot — clipping its outer rounding.
     */
    static int[] stackedSegmentHeights(int plotHeight, int[] values) {
        if (plotHeight <= 0 || values == null || values.length == 0) {
            return new int[0];
        }
        int total = 0;
        for (int value : values) {
            total += value;
        }
        if (total <= 0) {
            return new int[0];
        }
        int n = values.length;
        int[] heights = new int[n];
        int remaining = plotHeight;
        for (int i = 0; i < n; i++) {
            if (i == n - 1) {
                heights[i] = remaining;
                break;
            }
            int minTail = n - i - 1;
            int height = (int) Math.floor(values[i] * plotHeight / (double) total);
            height = Math.max(1, height);
            height = Math.min(height, Math.max(1, remaining - minTail));
            heights[i] = height;
            remaining -= height;
        }
        return heights;
    }
}
