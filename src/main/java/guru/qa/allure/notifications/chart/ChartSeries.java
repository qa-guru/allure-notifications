package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.mapper.LegendMapper;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

public class ChartSeries {
    private final List<int[]> colors = new ArrayList<>();
    private final LegendMapper legendMapper;
    private final SummaryMapper summaryMapper;

    public ChartSeries(Base base) {
        this.legendMapper = new LegendMapper(base);
        this.summaryMapper = new SummaryMapper(base);
    }

    public List<int[]> addSeriesTo(PieChart chart) {
        final Summary summary = summaryMapper.map();
        final Legend legend = legendMapper.map();

        final long passed = summary.statistic().passed();
        final long failed = summary.statistic().failed();
        final long broken = summary.statistic().broken();
        final long skipped = summary.statistic().skipped();
        final long unknown = summary.statistic().unknown();

        if (passed != 0) {
            chart.addSeries(String.format("%d %s", passed,
                    legend.passed()), passed);
            colors.add(new int[]{148, 202, 102});
        }
        if (failed != 0) {
            chart.addSeries(String.format("%d %s", failed,
                    legend.failed()), failed);
            colors.add(new int[]{255, 87, 68});
        }
        if (broken != 0) {
            chart.addSeries(String.format("%d %s", broken,
                    legend.broken()), broken);
            colors.add(new int[]{255, 206, 87});
        }
        if (skipped != 0) {
            chart.addSeries(String.format("%d %s", skipped,
                    legend.skipped()), skipped);
            colors.add(new int[]{170, 170, 170});
        }
        if (unknown != 0) {
            chart.addSeries(String.format("%d %s", unknown,
                    legend.unknown()), unknown);
            colors.add(new int[]{216, 97,  190});
        }

        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});
        colors.add(new int[]{0, 0, 0});

        return colors;
    }
}
