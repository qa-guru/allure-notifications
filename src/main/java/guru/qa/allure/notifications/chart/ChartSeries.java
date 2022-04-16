package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.mapper.LegendMapper;
import guru.qa.allure.notifications.mapper.SummaryMapper;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

public class ChartSeries {
    private static final List<int[]> COLORS = new ArrayList<>();
    private static final Legend legend = new LegendMapper().map();

    public static List<int[]> addSeriesTo(PieChart chart) {
        final Summary summary = new SummaryMapper().map();
        final long passed = summary.statistic().passed();
        final long failed = summary.statistic().failed();
        final long broken = summary.statistic().broken();
        final long skipped = summary.statistic().skipped();
        final long unknown = summary.statistic().unknown();

        if (passed != 0) {
            chart.addSeries(String.format("%d %s", passed,
                    legend.passed()), passed);
            COLORS.add(new int[]{148, 202, 102});
        }
        if (failed != 0) {
            chart.addSeries(String.format("%d %s", failed,
                    legend.failed()), failed);
            COLORS.add(new int[]{255, 87, 68});
        }
        if (broken != 0) {
            chart.addSeries(String.format("%d %s", broken,
                    legend.broken()), broken);
            COLORS.add(new int[]{255, 206, 87});
        }
        if (skipped != 0) {
            chart.addSeries(String.format("%d %s", skipped,
                    legend.skipped()), skipped);
            COLORS.add(new int[]{170, 170, 170});
        }
        if (unknown != 0) {
            chart.addSeries(String.format("%d %s", unknown,
                    legend.unknown()), unknown);
            COLORS.add(new int[]{216, 97,  190});
        }

        COLORS.add(new int[]{0, 0, 0});
        COLORS.add(new int[]{0, 0, 0});
        COLORS.add(new int[]{0, 0, 0});
        COLORS.add(new int[]{0, 0, 0});
        COLORS.add(new int[]{0, 0, 0});

        return COLORS;
    }
}
