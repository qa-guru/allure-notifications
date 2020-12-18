package allure.piechart.telegram.chart;

import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieSeries;

import javax.validation.constraints.NotNull;
import java.awt.*;

/**
 * Отвечает за создание вида диаграммы.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class ChartView {
    public static PieChart setView(final @NotNull PieChart chart) {
        chart.getStyler().setDefaultSeriesRenderStyle(PieSeries.PieSeriesRenderStyle.Donut);
        chart.getStyler().setDonutThickness(.2);
        chart.getStyler().setChartPadding(0);
        chart.getStyler().setCircular(true);

        chart.getStyler().setPlotContentSize(.9);
        chart.getStyler().setPlotBorderColor(Color.WHITE);
        chart.getStyler().setChartBackgroundColor(Color.WHITE);

        chart.getStyler().setSumVisible(true);
        chart.getStyler().setSumFontSize(30f);
        chart.getStyler().setDecimalPattern("#");

        return chart;
    }
}
