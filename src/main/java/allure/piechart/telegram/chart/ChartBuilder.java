package allure.piechart.telegram.chart;

import allure.piechart.telegram.models.Summary;
import org.knowm.xchart.PieChart;

import javax.validation.constraints.NotNull;
import java.awt.*;
import java.util.List;

/**
 * Отвечает за создание диаграммы.
 *
 * @author svasenkov
 * @since 1.0
 */
public class ChartBuilder {
    /**
     * Создаёт диаграмму на основе результата тестов.
     *
     * @param summary результат тестов
     * @param title заголовок диаграммы
     * @return pie-chart диаграмма
     */
    public static PieChart getChart(final @NotNull Summary summary, final @NotNull String title) {
        // Create Chart
        PieChart chart = new org.knowm.xchart.PieChartBuilder()
                .title(title)
                .width(500)
                .height(250)
                .build();

        // Customize Chart
        // Legend
        ChartLegend.setLegend(chart);

        // Piechart view
        ChartView.setView(chart);

        // Series // todo - make hiding legend items, if value = 0
        List<int[]> colors = ChartSeries.createSeries(summary, chart);

        // Slice colors
        Color[] sliceColors = ChartColors.getSliceColors(colors);
        chart.getStyler().setSeriesColors(sliceColors);

        return chart;
    }
}
