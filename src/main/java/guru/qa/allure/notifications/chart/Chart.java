package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import javax.imageio.ImageIO;
import java.io.File;

import guru.qa.allure.notifications.config.base.Base;

@Slf4j
public class Chart {

    public static byte[] createChart(Base base, Summary summary, Legend legend) throws MessageBuildException {
        log.info("Creating chart...");
        PieChart chart = ChartBuilder.createBaseChart(base);
        log.info("Adding legend to chart...");
        ChartLegend.addLegendTo(chart);
        log.info("Adding view to chart...");
        ChartView.addViewTo(chart);
        log.info("Adding series to chart...");
        List<Color> colors = new ChartSeries(summary, legend).addSeriesTo(chart);
        log.info("Adding colors to series...");
        chart.getStyler().setSeriesColors(colors.toArray(new Color[0]));
        BufferedImage chartImage = BitmapEncoder.getBufferedImage(chart);
        log.info("Chart is created.");

        if (base.getLogo() != null) {
            try {
                BufferedImage logo = ImageIO.read(new File(base.getLogo()));
                chartImage.getGraphics().drawImage(logo, 3, 3, null);
            } catch (Exception e) {
                log.warn("Logo file isn't existed: " + base.getLogo());
            }
        }

        try {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(chartImage, "png", os);
            return os.toByteArray();
        } catch (IOException e) {
            throw new MessageBuildException("Unable to create image with chart", e);
        }
    }
}
