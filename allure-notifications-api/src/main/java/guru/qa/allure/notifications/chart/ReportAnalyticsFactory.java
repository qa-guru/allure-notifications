package guru.qa.allure.notifications.chart;

import java.util.Collections;

import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.SuiteStat;

/**
 * Builds minimal {@link ReportAnalytics} instances for legacy pie rendering.
 */
final class ReportAnalyticsFactory {
    private ReportAnalyticsFactory() {
    }

    static ReportAnalytics fromStatistic(Statistic statistic) {
        return new ReportAnalytics(
                statistic,
                Collections.<String, Integer>emptyMap(),
                Collections.<SuiteStat>emptyList(),
                Collections.<Long>emptyList(),
                false,
                0);
    }
}
