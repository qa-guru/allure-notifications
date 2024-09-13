package guru.qa.allure.notifications.template.data;

import java.util.HashMap;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.formatters.Formatters;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.extern.slf4j.Slf4j;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for mapping template data for template.
 */
@Slf4j
public class MessageData {
    private final Base base;
    private final Summary summary;
    private final String suitesSummaryJson;
    private final Phrases phrases;
    private Map<String, Object> data;

    public MessageData(Base base, Summary summary, String suitesSummaryJson, Phrases phrases) {
        this.base = base;
        this.summary = summary;
        this.suitesSummaryJson = suitesSummaryJson;
        this.phrases = phrases;
    }

    public String getProject() {
        return base.getProject();
    }

    public Map<String, Object> getValues() {
        if (data == null) {
            this.data = new HashMap<>();
            log.info("Collecting template data");

            data.put("environment", base.getEnvironment());
            data.put("comment", base.getComment());
            data.put("reportLink", Formatters.formatReportLink(base.getReportLink()));
            data.put("customData", base.getCustomData());

            data.put("time", Formatters.formatDuration(summary.getTime().getDuration(), base.getDurationFormat()));
            data.put("statistic", summary.getStatistic());

            data.put("suitesSummaryJson", suitesSummaryJson);
            data.put("phrases", phrases);
            log.info("Template data: {}", data);
        }
        return data;
    }
}
