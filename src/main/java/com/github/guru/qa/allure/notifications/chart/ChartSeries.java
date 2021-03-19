package com.github.guru.qa.allure.notifications.chart;

import com.github.guru.qa.allure.notifications.model.Summary;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.readSummaryJson;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.allureReportFolder;

public class ChartSeries {
    public static List<int[]> addSeriesTo(PieChart chart) {
        Summary summary = readSummaryJson(allureReportFolder());
        long failed = summary.getStatistic().getFailed();
        long broken = summary.getStatistic().getBroken();
        long passed = summary.getStatistic().getPassed();
        long skipped = summary.getStatistic().getSkipped();
        long unknown = summary.getStatistic().getUnknown();

        List<int[]> colors = new ArrayList<>();
        if (passed != 0) {
            chart.addSeries(passed + " passed", passed);
            colors.add(new int[]{148, 202, 102});
        }

        if (failed != 0) {
            chart.addSeries(failed + " failed", failed);
            colors.add(new int[]{255, 87, 68});
        }
        if (skipped != 0) {
            chart.addSeries(skipped + " skipped", skipped);
            colors.add(new int[]{170, 170, 170});
        }
        if (broken != 0) {
            chart.addSeries(broken + " broken", broken);
            colors.add(new int[]{255, 206, 87});
        }
        if (unknown != 0) {
            chart.addSeries(unknown + " unknown", unknown);
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
