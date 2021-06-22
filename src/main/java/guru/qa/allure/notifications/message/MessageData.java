package guru.qa.allure.notifications.message;

import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Build;
import guru.qa.allure.notifications.language.Language;
import guru.qa.allure.notifications.summary.Summary;
import guru.qa.allure.notifications.util.JsonUtil;
import guru.qa.allure.notifications.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

import static guru.qa.allure.notifications.language.Locale.valueOf;

public class MessageData {
    private static final Logger LOG = LoggerFactory.getLogger("Message Data");
    private static final Language LANG = new Language(valueOf(Base.lang()));
    private static final Map<String, Object> data = new HashMap<>();

    public static Map<String, Object> values() {
        LOG.info("Collecting template data...");
        data.putAll(phrases());
        data.putAll(summary());
        data.putAll(build());
        LOG.info("Template data is collected.");
        return data;
    }

    private static Map<String, Object> phrases() {
        final Map<String, Object> phrases = new HashMap<>();
        LOG.info("Applying language phrases...");
        phrases.put("results", LANG.getPhrase("results"));
        phrases.put("environment", LANG.getPhrase("environment"));
        phrases.put("duration", LANG.getPhrase("duration"));
        phrases.put("totalScenarios", LANG.getPhrase("totalScenarios"));
        phrases.put("totalPassed", LANG.getPhrase("totalPassed"));
        phrases.put("totalFailed", LANG.getPhrase("totalFailed"));
        phrases.put("totalBroken", LANG.getPhrase("totalBroken"));
        phrases.put("totalUnknown", LANG.getPhrase("totalUnknown"));
        phrases.put("totalSkipped", LANG.getPhrase("totalSkipped"));
        phrases.put("ofPassedTests", LANG.getPhrase("ofPassedTests"));
        phrases.put("ofFailedTests", LANG.getPhrase("ofPassedTests"));
        phrases.put("reportAvailableByLink", LANG.getPhrase("reportAvailableByLink"));
        LOG.info("Done.");
        return phrases;
    }

    private static Map<String, Object> summary() {
        final Map<String, Object> summary = new HashMap<>();
        LOG.info("Applying Summary data...");
        final Summary sum = JsonUtil.parseFrom(Base.allureFolder());
        summary.put("time", Utils.convertDurationToTime(sum.time.duration));
        summary.put("total", sum.statistic.total);
        summary.put("passed", sum.statistic.passed);
        summary.put("failed", sum.statistic.failed);
        summary.put("broken", sum.statistic.broken);
        summary.put("unknown", sum.statistic.unknown);
        summary.put("skipped", sum.statistic.skipped);
        summary.put("passedPercentage",
                Utils.percentage(sum.statistic.passed, sum.statistic.total));
        summary.put("failedPercentage",
                Utils.percentage(sum.statistic.failed, sum.statistic.total));
        LOG.info("Done.");
        return summary;
    }

    private static Map<String, Object> build() {
        final Map<String, Object> buildInfo = new HashMap<>();
        LOG.info("Applying build data...");
        buildInfo.put("env", Build.env());
        buildInfo.put("reportLink", Build.reportLink());
        LOG.info("Done.");
        return buildInfo;
    }
}
