package guru.qa.allure.notifications.chart;

import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.language.Legend;
import guru.qa.allure.notifications.summary.Summary;
import guru.qa.allure.notifications.util.JsonUtil;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

import static guru.qa.allure.notifications.language.Locale.valueOf;

public class ChartSeries {
    private static final Legend LEGEND = new Legend(valueOf(Base.lang()));
    private static final List<int[]> COLORS = new ArrayList<>();

    public static List<int[]> addSeriesTo(PieChart chart) {
        final Summary summary = JsonUtil.parseFrom(Base.allureFolder());
        final long passed = summary.statistic.passed;
        final long failed = summary.statistic.failed;
        final long broken = summary.statistic.broken;
        final long skipped = summary.statistic.skipped;
        final long unknown = summary.statistic.unknown;

        if (passed != 0) {
            chart.addSeries(String.format("%d %s", passed,
                    LEGEND.getLegend("passed")), passed);
            COLORS.add(new int[]{148, 202, 102});
        }
        if (failed != 0) {
            chart.addSeries(String.format("%d %s", failed,
                    LEGEND.getLegend("failed")), failed);
            COLORS.add(new int[]{255, 87, 68});
        }
        if (broken != 0) {
            chart.addSeries(String.format("%d %s", broken,
                    LEGEND.getLegend("broken")), broken);
            COLORS.add(new int[]{255, 206, 87});
        }
        if (skipped != 0) {
            chart.addSeries(String.format("%d %s", skipped,
                    LEGEND.getLegend("skipped")), skipped);
            COLORS.add(new int[]{170, 170, 170});
        }
        if (unknown != 0) {
            chart.addSeries(String.format("%d %s", unknown,
                    LEGEND.getLegend("unknown")), unknown);
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
