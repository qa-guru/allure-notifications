package com.github.guru.qa.allure.notifications.chart;

import com.github.guru.qa.allure.notifications.config.Phrases;
import com.github.guru.qa.allure.notifications.model.Summary;
import org.aeonbits.owner.ConfigFactory;
import org.knowm.xchart.PieChart;

import java.util.ArrayList;
import java.util.List;

import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.readSummaryJson;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.allureReportFolder;

public class ChartSeries {
    private static final Phrases phrases = ConfigFactory.newInstance().create(Phrases.class);

    public static List<int[]> addSeriesTo(PieChart chart) {
        Summary summary = readSummaryJson(allureReportFolder());
        long failed = summary.statistic().failed();
        long broken = summary.statistic().broken();
        long passed = summary.statistic().passed();
        long skipped = summary.statistic().skipped();
        long unknown = summary.statistic().unknown();

        List<int[]> colors = new ArrayList<>();
        if (passed != 0) {
            chart.addSeries(passed + " " + phrases.passed(), passed);
            colors.add(new int[]{148, 202, 102});
        }

        if (failed != 0) {
            chart.addSeries(failed + " " + phrases.failed(), failed);
            colors.add(new int[]{255, 87, 68});
        }
        if (skipped != 0) {
            chart.addSeries(skipped + " " + phrases.skipped(), skipped);
            colors.add(new int[]{170, 170, 170});
        }
        if (broken != 0) {
            chart.addSeries(broken + " " + phrases.broken(), broken);
            colors.add(new int[]{255, 206, 87});
        }
        if (unknown != 0) {
            chart.addSeries(unknown + " " + phrases.unknown(), unknown);
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
