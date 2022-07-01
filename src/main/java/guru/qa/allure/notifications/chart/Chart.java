package guru.qa.allure.notifications.chart;

import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.PieChart;

import java.awt.*;
import java.util.List;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

import guru.qa.allure.notifications.config.base.Base;
@Slf4j
public class Chart {
    private final static String CHART_FILE_NAME = "chart";

    public static void createChart(Base base) {
        log.info("Creating chart...");
        PieChart chart = ChartBuilder.createBaseChart(base);
        log.info("Adding legend to chart...");
        ChartLegend.addLegendTo(chart);
        log.info("Adding view to chart...");
        ChartView.addViewTo(chart);
        log.info("Adding series to chart...");
        List<Color> colors = new ChartSeries(base).addSeriesTo(chart);
        log.info("Adding colors to series...");
        chart.getStyler().setSeriesColors(colors.toArray(new Color[0]));
        ChartSaver.saveChart(chart);
        log.info("Chart is created.");

        if (base.getLogo() != null) {
            try {
                BufferedImage source = ImageIO.read(new File(CHART_FILE_NAME + ".png"));
                BufferedImage logo = ImageIO.read(new File(base.getLogo()));

                source.getGraphics().drawImage(logo, 3, 3, null);
                File f = new File(CHART_FILE_NAME + ".png");
                ImageIO.write(source, "PNG", f);
            } catch (Exception e) {
                log.warn("Logo file isn't existed: " + base.getLogo());
            }
        }
    }
}
