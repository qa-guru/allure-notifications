package com.github.guru.qa.allure.notifications.chart;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;

import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.projectName;
import static org.knowm.xchart.BitmapEncoder.BitmapFormat.PNG;

public class Chart {
    private static final Logger LOG = LoggerFactory.getLogger(Chart.class);
    private final static String FILE_NAME = "piechart";
    private final static String LOGO_FILE_NAME = "logo";

    public static void createChart() {
        final String title = projectName();
        LOG.info("Create chart with title {}", title);
        PieChart chart = new org.knowm.xchart.PieChartBuilder()
                .title(title)
                .width(500)
                .height(250)
                .build();

        LOG.info("Add legend to chart");
        ChartLegend.addLegendTo(chart);
        LOG.info("Add view to chart");
        ChartView.addViewTo(chart);
        LOG.info("Add series to chart");
        List<int[]> colors = ChartSeries.addSeriesTo(chart);
        LOG.info("Add colors to series");
        ChartColors.addColorsTo(chart, colors);
        try {
            LOG.info("Try to save chart as {}.png", FILE_NAME);
            BitmapEncoder.saveBitmap(chart, FILE_NAME, PNG);
            LOG.info("Chart is created successfully");

        } catch (IOException e) {
            LOG.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
        try {
            BufferedImage source = ImageIO.read(new File(FILE_NAME+".png"));
            BufferedImage logo = ImageIO.read(new File(LOGO_FILE_NAME+".png"));

            source.getGraphics().drawImage(logo, 3, 3, null);
            File f = new File(FILE_NAME+".png");
            ImageIO.write(source, "PNG", f);
        } catch (Exception e) {
            LOG.info("Logo file isn't existed");
        }
    }
}
