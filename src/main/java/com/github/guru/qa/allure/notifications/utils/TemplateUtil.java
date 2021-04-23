package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.Phrases;
import com.github.guru.qa.allure.notifications.model.Summary;
import org.aeonbits.owner.ConfigFactory;

import static com.github.guru.qa.allure.notifications.utils.BuildInfoHelper.*;
import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.readSummaryJson;
import static com.github.guru.qa.allure.notifications.utils.NumberUtils.percentage;
import static com.github.guru.qa.allure.notifications.utils.TimeUtil.time;

public class TemplateUtil {
    private static final Phrases phrases = ConfigFactory.newInstance().create(Phrases.class);

    /** Возвращает данные для шаблона. */
    public static Object[] templateData() {
        Summary summary = readSummaryJson(SettingsHelper.allureReportFolder());
        return new Object[] {
                phrases.resultsLabel(),
                phrases.launchLabel(),
                buildLaunchName(),
                phrases.durationLabel(),
                time(summary.time().duration()),
                phrases.environmentLabel(),
                buildEnvironment(),
                phrases.totalScenariosLabel(),
                summary.statistic().total(),
                phrases.totalPassedLabel(),
                summary.statistic().passed(),
                phrases.totalFailedLabel(),
                summary.statistic().failed(),
                phrases.totalBrokenLabel(),
                summary.statistic().broken(),
                phrases.totalUnknownLabel(),
                summary.statistic().unknown(),
                phrases.totalSkippedLabel(),
                summary.statistic().skipped(),
                phrases.ofPassedTestsLabel(),
                percentage(summary.statistic().passed(), summary.statistic().total()),
                phrases.ofFailedTestsLabel(),
                percentage(summary.statistic().failed(), summary.statistic().total()),
                phrases.reportLinkLabel(),
                buildReportLink()
        };
    }
}
