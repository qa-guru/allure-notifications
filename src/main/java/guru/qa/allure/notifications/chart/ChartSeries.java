package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.mapper.LegendMapper;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import org.knowm.xchart.PieChart;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class ChartSeries {
    private final LegendMapper legendMapper;
    private final SummaryMapper summaryMapper;

    public ChartSeries(Base base) {
        this.legendMapper = new LegendMapper(base);
        this.summaryMapper = new SummaryMapper(base);
    }

    public List<Color> addSeriesTo(PieChart chart) {
        List<Color> colors = new ArrayList<>();
        final Summary summary = summaryMapper.map();
        final Legend legend = legendMapper.map();

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
