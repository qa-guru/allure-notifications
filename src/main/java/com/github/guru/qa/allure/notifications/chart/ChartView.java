package com.github.guru.qa.allure.notifications.chart;

import org.knowm.xchart.PieChart;

import static java.awt.Color.WHITE;
import static org.knowm.xchart.PieSeries.PieSeriesRenderStyle.Donut;

public class ChartView {
    public static void addViewTo(PieChart chart) {
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
    }
}
