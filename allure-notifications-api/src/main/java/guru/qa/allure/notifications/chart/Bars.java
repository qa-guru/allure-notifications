package guru.qa.allure.notifications.chart;

import java.awt.Graphics2D;

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
     *
     * @param maxArc corner diameter cap; clamped to the bar width/height.
     */
    static void fillTopRounded(Graphics2D graphics, int x, int y, int width, int height, int maxArc) {
        if (width <= 0 || height <= 0) {
            return;
        }
        int arc = Math.max(2, Math.min(Math.min(width, height), maxArc));
        if (height >= arc) {
            graphics.fillRoundRect(x, y, width, height, arc, arc);
            // Re-square the bottom corners so the bar meets the baseline flush.
            graphics.fillRect(x, y + height - arc, width, arc);
        } else {
            graphics.fillRoundRect(x, y, width, height, height, height);
        }
    }

    /** Horizontal bar with fully rounded caps (pill), for left-anchored bars. */
    static void fillPill(Graphics2D graphics, int x, int y, int width, int height) {
        if (width <= 0 || height <= 0) {
            return;
        }
        int arc = Math.min(height, width);
        graphics.fillRoundRect(x, y, width, height, arc, arc);
    }
}
