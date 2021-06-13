package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.helpers.Base;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import static org.knowm.xchart.BitmapEncoder.BitmapFormat.PNG;

public class ChartSaver {
    private static final Logger LOG = LoggerFactory.getLogger("Chart Saver");

    public static void saveChart(PieChart chart) {
        final String name = Base.chartName();
        try {
            LOG.info("Trying to save chart as {}.png...", name);
            BitmapEncoder.saveBitmap(chart, name, PNG);
            LOG.info("Done.");
        } catch (IOException e) {
            LOG.error("Unable to save chart! {}", e.getCause().getLocalizedMessage());
            System.exit(1);
        }
    }
}
