package guru.qa.allure.notifications.template.data;

import java.util.HashMap;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for mapping template data for template.
 */
@Slf4j
@Getter
public class MessageData {
    private final String project;
    private final BuildData buildData;
    private final SummaryData summaryData;
    private final PhrasesData phrasesData;
    private Map<String, Object> data;

    public MessageData(Base base, Summary summary, Phrases phrases) {
        this.project = base.getProject();
        this.buildData = new BuildData(base);
        this.summaryData = new SummaryData(base, summary);
        this.phrasesData = new PhrasesData(phrases);
    }

    public Map<String, Object> getValues() {
        if (data == null) {
            this.data = new HashMap<>();
            log.info("Collecting template data");
            data.putAll(buildData.map());
            data.putAll(summaryData.map());
            data.putAll(phrasesData.map());
            log.info("Template data: {}", data);
        }
        return data;
    }
}
