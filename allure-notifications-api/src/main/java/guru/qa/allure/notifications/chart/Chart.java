package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieChartBuilder;

import java.awt.Color;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;
import java.io.File;

import guru.qa.allure.notifications.config.base.Base;
import static java.awt.Color.WHITE;
import static org.knowm.xchart.PieSeries.PieSeriesRenderStyle.Donut;
import static org.knowm.xchart.style.Styler.LegendLayout.Vertical;
import static org.knowm.xchart.style.Styler.LegendPosition.OutsideE;

@Slf4j
public class Chart {

    public static byte[] createChart(Base base, Statistic statistic, Legend legend) throws MessageBuildException {
        final String title = base.getProject();
        log.info("Creating chart with title {}...", title);

        PieChart chart = new PieChartBuilder()
                .title(title)
                .width(500)
                .height(250)
                .build();

        log.debug("Adding legend to chart...");
        addLegend(chart);

        log.debug("Adding view to chart...");
        chart.getStyler()
                .setDefaultSeriesRenderStyle(Donut)
                .setCircular(true)
                .setSumVisible(true)
                .setSumFontSize(30f)
                .setDonutThickness(.2);
        chart.getStyler()
                .setChartPadding(0)
                .setPlotContentSize(.9)
                .setPlotBorderColor(WHITE)
                .setChartBackgroundColor(WHITE)
                .setDecimalPattern("#");

        log.debug("Adding series to chart...");
        addSeries(chart, statistic, legend);

        BufferedImage chartImage = BitmapEncoder.getBufferedImage(chart);
        log.info("Chart is created.");

        addLogo(base, chart, chartImage);

        try {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(chartImage, "png", os);
            return os.toByteArray();
        } catch (IOException e) {
            throw new MessageBuildException("Unable to create image with chart", e);
        }
    }

    private static void addLegend(PieChart chart) {
        chart.getStyler()
                .setLegendVisible(true)
                .setLegendPosition(OutsideE)
                .setLegendPadding(8)
                .setLegendBorderColor(WHITE)
                .setLegendLayout(Vertical);
    }

    private static void addSeries(PieChart chart, Statistic statistic, Legend legend) {
        List<Color> colors = new ArrayList<>();
        addSeries(chart, colors, statistic.getPassed(), legend.getPassed(),  new Color(148, 202, 102));
        addSeries(chart, colors, statistic.getFailed(), legend.getFailed(), new Color(255, 87, 68));
        addSeries(chart, colors, statistic.getBroken(), legend.getBroken(), new Color(255, 206, 87));
        addSeries(chart, colors, statistic.getSkipped(), legend.getSkipped(), new Color(170, 170, 170));
        addSeries(chart, colors, statistic.getUnknown(), legend.getUnknown(), new Color(216, 97,  190));

        chart.getStyler().setSeriesColors(colors.toArray(new Color[0]));
    }

    private static void addSeries(PieChart chart, List<Color> colors, Integer value, String legend, Color color) {
        if (value != 0) {
            chart.addSeries(String.format("%d %s", value, legend), value);
            colors.add(color);
        }
    }

    private static void addLogo(Base base, PieChart chart, BufferedImage chartImage) {
        String logo = base.getLogo();
        if (logo != null) {
            try {
                BufferedImage originalLogo = ImageIO.read(new File(logo));
                Image scaledLogo = LogoScaler.scaleLogo(originalLogo, chart.getWidth(), chart.getHeight());
                chartImage.getGraphics().drawImage(scaledLogo, 3, 3, null);
            } catch (IOException e) {
                log.warn("Logo file does not exist: {}", logo);
            }
        }
    }
}
