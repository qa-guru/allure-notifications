package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.report.ReportAnalytics;

/**
 * Rendering context shared by collage panels.
 */
public final class PanelContext {
    private final Base base;
    private final ChartTheme theme;
    private final int width;
    private final int height;
    private final ReportAnalytics analytics;
    private final Legend legend;

    public PanelContext(Base base,
                        ChartTheme theme,
                        int width,
                        int height,
                        ReportAnalytics analytics,
                        Legend legend) {
        this.base = base;
        this.theme = theme;
        this.width = width;
        this.height = height;
        this.analytics = analytics;
        this.legend = legend;
    }

    public static PanelContext of(Base base,
                                  int width,
                                  int height,
                                  ReportAnalytics analytics,
                                  Legend legend) {
        return new PanelContext(base, ChartTheme.from(base), width, height, analytics, legend);
    }

    public Base getBase() {
        return base;
    }

    public ChartTheme getTheme() {
        return theme;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public ReportAnalytics getAnalytics() {
        return analytics;
    }

    public Legend getLegend() {
        return legend;
    }
}
