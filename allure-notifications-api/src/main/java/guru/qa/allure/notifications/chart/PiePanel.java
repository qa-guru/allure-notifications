package guru.qa.allure.notifications.chart;

import static org.knowm.xchart.PieSeries.PieSeriesRenderStyle.Donut;
import static org.knowm.xchart.style.Styler.LegendLayout.Vertical;
import static org.knowm.xchart.style.Styler.LegendPosition.OutsideE;

import java.awt.Color;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import lombok.extern.slf4j.Slf4j;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieChartBuilder;

@Slf4j
public class PiePanel implements ChartPanel {
    public static final String ID = "pie";

    @Override
    public String getId() {
        return ID;
    }

    public static byte[] createChart(Base base, Statistic statistic, Legend legend) throws MessageBuildException {
        PanelContext context = PanelContext.of(
                base,
                500,
                250,
                ReportAnalyticsFactory.fromStatistic(statistic),
                legend);
        return ChartImageEncoder.toPngBytes(new PiePanel().render(context));
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        Base base = context.getBase();
        ChartTheme theme = context.getTheme();
        Legend legend = context.getLegend();
        Statistic statistic = context.getAnalytics().getStatistic();
        if (statistic == null) {
            throw new MessageBuildException("Statistic is required for pie panel", null);
        }
        if (legend == null) {
            throw new MessageBuildException("Legend is required for pie panel", null);
        }

        final String title = base.getProject();
        log.info("Creating pie panel with title {}...", title);

        PieChart chart = new PieChartBuilder()
                .title(title)
                .width(context.getWidth())
                .height(context.getHeight())
                .build();

        addLegend(chart, theme.getBackground());
        chart.getStyler()
                .setDefaultSeriesRenderStyle(Donut)
                .setCircular(true)
                .setSumVisible(true)
                .setSumFontSize(30f)
                .setDonutThickness(.2);
        chart.getStyler()
                .setChartPadding(0)
                .setPlotContentSize(.9)
                .setChartFontColor(theme.getText())
                .setPlotBackgroundColor(theme.getBackground())
                .setPlotBorderColor(theme.getBackground())
                .setChartBackgroundColor(theme.getBackground())
                .setLegendBackgroundColor(theme.getBackground())
                .setDecimalPattern("#");
        chart.getStyler()
                .setLabelsFontColor(theme.getText())
                .setLabelsFontColorAutomaticEnabled(false);

        addSeries(chart, statistic, legend);

        BufferedImage chartImage = BitmapEncoder.getBufferedImage(chart);
        addLogo(base, chart, chartImage);
        log.info("Pie panel is created.");
        return chartImage;
    }

    private static void addLegend(PieChart chart, Color bgColor) {
        chart.getStyler()
                .setLegendVisible(true)
                .setLegendPosition(OutsideE)
                .setLegendPadding(8)
                .setLegendBorderColor(bgColor)
                .setLegendLayout(Vertical);
    }

    private static void addSeries(PieChart chart, Statistic statistic, Legend legend) {
        List<Color> colors = new ArrayList<Color>();
        addSeries(chart, colors, statistic.getPassed(), legend.getPassed(), ChartTheme.STATUS_PASSED);
        addSeries(chart, colors, statistic.getFailed(), legend.getFailed(), ChartTheme.STATUS_FAILED);
        addSeries(chart, colors, statistic.getBroken(), legend.getBroken(), ChartTheme.STATUS_BROKEN);
        addSeries(chart, colors, statistic.getSkipped(), legend.getSkipped(), ChartTheme.STATUS_SKIPPED);
        addSeries(chart, colors, statistic.getUnknown(), legend.getUnknown(), ChartTheme.STATUS_UNKNOWN);
        chart.getStyler().setSeriesColors(colors.toArray(new Color[0]));
    }

    private static void addSeries(PieChart chart, List<Color> colors, Integer value, String legend, Color color) {
        if (value != null && value != 0) {
            chart.addSeries(String.format("%d %s", value, legend), value);
            colors.add(color);
        }
    }

    private static void addLogo(Base base, PieChart chart, BufferedImage chartImage) {
        String logo = base.getLogo();
        if (logo == null) {
            return;
        }
        try {
            BufferedImage originalLogo = ImageIO.read(new File(logo));
            Image scaledLogo = LogoScaler.scaleLogo(originalLogo, chart.getWidth(), chart.getHeight());
            chartImage.getGraphics().drawImage(scaledLogo, 3, 3, null);
        } catch (IOException e) {
            log.warn("Logo file does not exist: {}", logo);
        }
    }
}
