package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.Phrases;
import com.github.guru.qa.allure.notifications.model.Summary;
import org.aeonbits.owner.ConfigFactory;

import static com.github.guru.qa.allure.notifications.utils.BuildInfoHelper.*;
import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.readSummaryJson;
import static com.github.guru.qa.allure.notifications.utils.TimeUtil.time;

/**
 * Вспомогательный класс для заполнения шаблона сообщения.
 *
 * @author kadehar
 * @since 2.0.10
 */
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
                time(summary.getTime().getDuration()),
                phrases.environmentLabel(),
                buildEnvironment(),
                phrases.totalScenariosLabel(),
                summary.getStatistic().getTotal(),
                phrases.totalPassedLabel(),
                summary.getStatistic().getPassed(),
                phrases.totalFailedLabel(),
                summary.getStatistic().getFailed(),
                phrases.totalBrokenLabel(),
                summary.getStatistic().getBroken(),
                phrases.totalUnknownLabel(),
                summary.getStatistic().getUnknown(),
                phrases.totalSkippedLabel(),
                summary.getStatistic().getSkipped(),
                phrases.ofPassedTestsLabel(),
                (summary.getStatistic().getPassed() * 100) / summary.getStatistic().getTotal(),
                phrases.ofFailedTestsLabel(),
                (summary.getStatistic().getFailed() * 100) / summary.getStatistic().getTotal(),
                phrases.reportLinkLabel(),
                buildReportLink()
        };
    }
}
