package com.github.guru.qa.allure.notifications.chart;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;

import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.projectName;
import static org.knowm.xchart.BitmapEncoder.BitmapFormat.PNG;

public class Chart {
    private static final Logger LOGGER = LoggerFactory.getLogger(Chart.class);
    private final static String DEFAULT_FILE_NAME = "piechart";

    public static void createChart() {
        final String title = projectName();
        LOGGER.info("Create chart with title {}", title);
        PieChart chart = new org.knowm.xchart.PieChartBuilder()
                .title(title)
                .width(500)
                .height(250)
                .build();

        LOGGER.info("Add legend to chart");
        ChartLegend.addLegendTo(chart);
        LOGGER.info("Add view to chart");
        ChartView.addViewTo(chart);
        LOGGER.info("Add series to chart");
        List<int[]> colors = ChartSeries.addSeriesTo(chart);
        LOGGER.info("Add colors to series");
        ChartColors.addColorsTo(chart, colors);

        try {
            LOGGER.info("Try to save chart as {}.png", DEFAULT_FILE_NAME);
            BitmapEncoder.saveBitmap(chart, DEFAULT_FILE_NAME, PNG);
            LOGGER.info("Chart is created successfully");
        } catch (IOException e) {
            LOGGER.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
