package guru.qa.allure.notifications.chart;

import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;

import java.io.IOException;

import static org.knowm.xchart.BitmapEncoder.BitmapFormat.PNG;
@Slf4j
public class ChartSaver {

    public static void saveChart(PieChart chart) {
        final String name = "chart";
        try {
            log.info("Trying to save chart as {}.png...", name);
            BitmapEncoder.saveBitmap(chart, name, PNG);
            log.info("Done.");
        } catch (IOException e) {
            log.error("Unable to save chart! {}", e.getCause().getLocalizedMessage());
            System.exit(1);
        }
    }
}
