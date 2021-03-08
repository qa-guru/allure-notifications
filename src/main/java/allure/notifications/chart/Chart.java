package allure.notifications.chart;

import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.IOException;

public class Chart {
    private static final Logger LOGGER = LoggerFactory.getLogger(Chart.class);

    public final static String PIECHART_FILE_NAME = "piechart";

    public static void createChart(final @NotNull OptionsValues values, final @NotNull Summary summary) {
        LOGGER.info("Create chart");
        PieChart chart = ChartBuilder.getChart(summary, values.getProjectName());
        LOGGER.info("Chart title: {}", chart.getTitle());
        try {
            LOGGER.info("Try to save chart as a picture {}.png", PIECHART_FILE_NAME);
            BitmapEncoder.saveBitmap(chart, PIECHART_FILE_NAME, BitmapEncoder.BitmapFormat.PNG);
            LOGGER.info("Chart is created successfully");
        } catch (IOException e) {
            LOGGER.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
