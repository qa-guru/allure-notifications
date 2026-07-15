package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;

/**
 * Chart entry point: legacy pie (4.x) or collage PNG (5.0+).
 */
public final class Chart {
    private Chart() {
    }

    public static byte[] createChart(Base base, Statistic statistic, Legend legend) throws MessageBuildException {
        return PiePanel.createChart(base, statistic, legend);
    }

    public static byte[] createChart(Base base, Summary summary, Legend legend) throws MessageBuildException {
        ChartConfig chartConfig = base != null ? base.getChart() : null;
        if (chartConfig != null && "collage".equalsIgnoreCase(chartConfig.getMode())) {
            ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);
            return CollageRenderer.render(base, analytics, legend);
        }
        Statistic statistic = summary != null ? summary.getStatistic() : null;
        return PiePanel.createChart(base, statistic, legend);
    }
}
