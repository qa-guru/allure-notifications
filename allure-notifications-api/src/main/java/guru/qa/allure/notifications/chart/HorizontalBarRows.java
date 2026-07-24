package guru.qa.allure.notifications.chart;

import java.awt.FontMetrics;

/**
 * Vertical slot layout for left-label + horizontal-bar panels (suites, severities,
 * durations-by-layer, …). Rows grow with the tile when there are enough of them,
 * but stay capped so a single suite cannot inflate into a near-circular pill that
 * fills the whole collage cell.
 */
final class HorizontalBarRows {

    private static final int MIN_ROW_HEIGHT = 14;
    /** Soft ceiling — keeps sparse rows compact instead of stretching to plotH. */
    private static final int MAX_ROW_HEIGHT = 34;
    private static final int MAX_BAR_HEIGHT = 18;

    static final class Layout {
        final int chartTop;
        final int rowHeight;
        final int gap;
        final int barHeight;
        final int fontSize;

        Layout(int chartTop, int rowHeight, int gap, int barHeight, int fontSize) {
            this.chartTop = chartTop;
            this.rowHeight = rowHeight;
            this.gap = gap;
            this.barHeight = barHeight;
            this.fontSize = fontSize;
        }

        int rowTop(int index) {
            return chartTop + index * (rowHeight + gap);
        }

        int barTop(int index) {
            return rowTop(index) + (rowHeight - barHeight) / 2;
        }

        int textBaseline(FontMetrics metrics, int index) {
            int top = rowTop(index);
            return top + (rowHeight + metrics.getAscent() - metrics.getDescent()) / 2;
        }
    }

    static Layout layout(int height, boolean showTitle, int rowCount) {
        int chartTop = PanelPlotArea.chartTop(showTitle);
        int plotH = PanelPlotArea.chartHeight(height, showTitle);
        int n = Math.max(1, rowCount);
        int gap = n <= 1 ? 0 : Math.max(2, plotH / (n * 10));
        int rowHeight = Math.max(MIN_ROW_HEIGHT,
                Math.min(MAX_ROW_HEIGHT, (plotH - gap * (n - 1)) / n));
        int barHeight = Math.max(4,
                Math.min(MAX_BAR_HEIGHT, (int) Math.round(rowHeight * 0.52)));
        int fontSize = Math.max(9, Math.min(13, rowHeight - 5));
        return new Layout(chartTop, rowHeight, gap, barHeight, fontSize);
    }

    private HorizontalBarRows() {
    }
}
