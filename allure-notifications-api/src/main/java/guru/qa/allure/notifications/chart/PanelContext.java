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
    // When false the panel omits its own in-canvas title (the collage card's header
    // bar already captions it) and reclaims that top strip as chart area.
    private final boolean showTitle;
    private final String groupBy;
    private final String by;

    public PanelContext(Base base,
                        ChartTheme theme,
                        int width,
                        int height,
                        ReportAnalytics analytics,
                        Legend legend) {
        this(base, theme, width, height, analytics, legend, true, null, null);
    }

    public PanelContext(Base base,
                        ChartTheme theme,
                        int width,
                        int height,
                        ReportAnalytics analytics,
                        Legend legend,
                        boolean showTitle) {
        this(base, theme, width, height, analytics, legend, showTitle, null, null);
    }

    public PanelContext(Base base,
                        ChartTheme theme,
                        int width,
                        int height,
                        ReportAnalytics analytics,
                        Legend legend,
                        boolean showTitle,
                        String groupBy,
                        String by) {
        this.base = base;
        this.theme = theme;
        this.width = width;
        this.height = height;
        this.analytics = analytics;
        this.legend = legend;
        this.showTitle = showTitle;
        this.groupBy = groupBy;
        this.by = by;
    }

    public static PanelContext of(Base base,
                                  int width,
                                  int height,
                                  ReportAnalytics analytics,
                                  Legend legend) {
        return new PanelContext(base, ChartTheme.from(base), width, height, analytics, legend, true);
    }

    public static PanelContext of(Base base,
                                  int width,
                                  int height,
                                  ReportAnalytics analytics,
                                  Legend legend,
                                  boolean showTitle) {
        return new PanelContext(base, ChartTheme.from(base), width, height, analytics, legend, showTitle);
    }

    public static PanelContext of(Base base,
                                  int width,
                                  int height,
                                  ReportAnalytics analytics,
                                  Legend legend,
                                  boolean showTitle,
                                  String groupBy,
                                  String by) {
        return new PanelContext(base, ChartTheme.from(base), width, height, analytics, legend,
                showTitle, groupBy, by);
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

    public boolean isShowTitle() {
        return showTitle;
    }

    /**
     * Optional catalog {@code groupBy} (e.g. {@code layer}).
     */
    public String getGroupBy() {
        return groupBy;
    }

    /**
     * Optional catalog {@code by} dimension (e.g. {@code environment}).
     */
    public String getBy() {
        return by;
    }
}
