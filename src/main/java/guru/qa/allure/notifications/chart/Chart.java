package guru.qa.allure.notifications.chart;

import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import guru.qa.allure.notifications.config.base.Base;

public class Chart {
    private static final Logger LOG = LoggerFactory.getLogger("Chart");

    public static void createChart(Base base) {
        LOG.info("Creating chart...");
        PieChart chart = ChartBuilder.createBaseChart(base);
        LOG.info("Adding legend to chart...");
        ChartLegend.addLegendTo(chart);
        LOG.info("Adding view to chart...");
        ChartView.addViewTo(chart);
        LOG.info("Adding series to chart...");
        List<int[]> colors = new ChartSeries(base).addSeriesTo(chart);
        LOG.info("Adding colors to series...");
        ChartColors.addColorsTo(colors, chart);
        ChartSaver.saveChart(chart);
        LOG.info("Chart is created.");
    }
}
