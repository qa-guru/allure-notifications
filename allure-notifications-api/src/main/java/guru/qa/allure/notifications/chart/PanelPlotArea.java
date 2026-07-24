package guru.qa.allure.notifications.chart;

/** Shared plot inset for collage tile bodies (header is drawn by {@link CollageRenderer}). */
final class PanelPlotArea {

    static final int MARGIN = 16;
    static final int TITLE_HEIGHT = 24;

    static int chartTop(boolean showTitle) {
        return showTitle ? MARGIN + TITLE_HEIGHT : MARGIN;
    }

    static int chartBottom(int height) {
        return height - MARGIN;
    }

    static int chartHeight(int height, boolean showTitle) {
        return Math.max(1, chartBottom(height) - chartTop(showTitle));
    }

    private PanelPlotArea() {
    }
}
