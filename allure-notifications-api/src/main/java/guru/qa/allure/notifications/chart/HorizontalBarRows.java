package guru.qa.allure.notifications.chart;

import java.awt.FontMetrics;

/**
 * Vertical slot layout for left-label + horizontal-bar panels (durations-by-layer,
 * severities, …). Rows distribute from {@code chartTop} to the bottom margin so
 * charts fill the collage tile body instead of hugging the top at a fixed 22px pitch.
 */
final class HorizontalBarRows {

    private static final int MIN_ROW_HEIGHT = 14;

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
        int rowHeight = Math.max(MIN_ROW_HEIGHT, (plotH - gap * (n - 1)) / n);
        int barHeight = Math.max(4, (int) Math.round(rowHeight * 0.52));
        int fontSize = Math.max(9, Math.min(13, rowHeight - 5));
        return new Layout(chartTop, rowHeight, gap, barHeight, fontSize);
    }

    private HorizontalBarRows() {
    }
}
