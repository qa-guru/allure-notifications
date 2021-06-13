package guru.qa.allure.notifications.chart;

import org.knowm.xchart.PieChart;

import java.awt.*;
import java.util.List;

public class ChartColors {
    public static void addColorsTo(List<int[]> colors, PieChart chart) {
        final Color[] sliceColors = new Color[]{
                new Color(colors.get(0)[0], colors.get(0)[1], colors.get(0)[2]),
                new Color(colors.get(1)[0], colors.get(1)[1], colors.get(1)[2]),
                new Color(colors.get(2)[0], colors.get(2)[1], colors.get(2)[2]),
                new Color(colors.get(3)[0], colors.get(3)[1], colors.get(3)[2]),
                new Color(colors.get(4)[0], colors.get(4)[1], colors.get(4)[2])
        };

        chart.getStyler().setSeriesColors(sliceColors);
    }
}
