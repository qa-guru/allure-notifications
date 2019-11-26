package piechart.telegram;

import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieSeries;
import org.knowm.xchart.style.Styler;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;


public class PieChartBuilder {
    public static PieChart getChart(List<Long> data, String title) {

        Long failed = data.get(0);
        Long broken = data.get(1);
        Long passed = data.get(2);
        Long skipped = data.get(3);
        Long unknown = data.get(4);

        // Create Chart
        PieChart chart =
            new org.knowm.xchart.PieChartBuilder()
                    .title(title)
                    .width(500)
                    .height(250)
                    .build();

        // Customize Chart
        // Legend
        chart.getStyler().setLegendVisible(true);
        chart.getStyler().setLegendPosition(Styler.LegendPosition.OutsideE);
        chart.getStyler().setLegendLayout(Styler.LegendLayout.Vertical);
        chart.getStyler().setLegendPadding(4);
        chart.getStyler().setLegendBorderColor(Color.WHITE);

        // Piechart view
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

        // Series // todo - make hiding legend items, if value = 0
        List<int[]> colors = new ArrayList<>();
        if (passed!=0) {
            chart.addSeries(passed + " passed", passed);
            colors.add(new int[]{148, 202, 102});
        }

        if (failed!=0) {
            chart.addSeries(failed + " failed", failed);
            colors.add(new int[]{255, 87, 68});
        }
        if (skipped!=0) {
            chart.addSeries(skipped + " skipped", skipped);
            colors.add(new int[]{170, 170, 170});
        }
        if (broken!=0) {
            chart.addSeries(broken + " broken", broken);
            colors.add(new int[]{255, 206, 87});
        }
        if (unknown!=0) {
            chart.addSeries(unknown + " unknown", unknown);
            colors.add(new int[]{216, 97,  190});
        }
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});

        // Slice colors
        Color[] sliceColors =
                new Color[] {
                        new Color(colors.get(0)[0], colors.get(0)[1], colors.get(0)[2]),
                        new Color(colors.get(1)[0], colors.get(1)[1], colors.get(1)[2]),
                        new Color(colors.get(2)[0], colors.get(2)[1], colors.get(2)[2]),
                        new Color(colors.get(3)[0], colors.get(3)[1], colors.get(3)[2]),
                        new Color(colors.get(4)[0], colors.get(4)[1], colors.get(4)[2])
                };
        chart.getStyler().setSeriesColors(sliceColors);

        return chart;
    }
}
