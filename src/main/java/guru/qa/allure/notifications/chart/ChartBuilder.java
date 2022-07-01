package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieChartBuilder;

@Slf4j
public class ChartBuilder {

    public static PieChart createBaseChart(Base base) {
        final String title = base.getProject();
        log.info("Creating chart with title {}...", title);
        PieChart chart = new PieChartBuilder()
                .title(title)
                .width(500)
                .height(250)
                .build();
        log.info("Done.");
        return chart;
    }
}
