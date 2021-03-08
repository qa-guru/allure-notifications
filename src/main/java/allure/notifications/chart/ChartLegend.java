package allure.notifications.chart;

import org.knowm.xchart.PieChart;
import org.knowm.xchart.style.Styler;

import javax.validation.constraints.NotNull;
import java.awt.*;

/**
 * Отвечает за создание легенды диаграммы.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class ChartLegend {
    public static PieChart setLegend(final @NotNull PieChart chart) {
        chart.getStyler().setLegendVisible(true);
        chart.getStyler().setLegendPosition(Styler.LegendPosition.OutsideE);
        chart.getStyler().setLegendLayout(Styler.LegendLayout.Vertical);
        chart.getStyler().setLegendPadding(4);
        chart.getStyler().setLegendBorderColor(Color.WHITE);

        return chart;
    }
}
