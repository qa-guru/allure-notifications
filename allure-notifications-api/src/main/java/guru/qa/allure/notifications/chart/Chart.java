package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;

/**
 * Legacy chart entry point. Delegates to {@link PiePanel} for backward compatibility.
 */
public final class Chart {
    private Chart() {
    }

    public static byte[] createChart(Base base, Statistic statistic, Legend legend) throws MessageBuildException {
        return PiePanel.createChart(base, statistic, legend);
    }
}
