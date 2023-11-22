package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import org.knowm.xchart.PieChart;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class ChartSeries {
    private final Summary summary;
    private final Legend legend;

    public ChartSeries(Summary summary, Legend legend) {
        this.summary = summary;
        this.legend = legend;
    }

    public List<Color> addSeriesTo(PieChart chart) {
        List<Color> colors = new ArrayList<>();

        addSeries(chart, colors, summary.getStatistic().getPassed(), legend.getPassed(),  new Color(148, 202, 102));
        addSeries(chart, colors, summary.getStatistic().getFailed(), legend.getFailed(), new Color(255, 87, 68));
        addSeries(chart, colors, summary.getStatistic().getBroken(), legend.getBroken(), new Color(255, 206, 87));
        addSeries(chart, colors, summary.getStatistic().getSkipped(), legend.getSkipped(), new Color(170, 170, 170));
        addSeries(chart, colors, summary.getStatistic().getUnknown(), legend.getUnknown(), new Color(216, 97,  190));

        return colors;
    }

    private void addSeries(PieChart chart, List<Color> colors, Integer value, String legend, Color color) {
        if (value != 0) {
            chart.addSeries(String.format("%d %s", value,
                    legend), value);
            colors.add(color);
        }
    }
}
