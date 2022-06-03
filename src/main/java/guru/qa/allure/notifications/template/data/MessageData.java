package guru.qa.allure.notifications.template.data;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for mapping template data for template.
 */
public class MessageData {
    private static final Logger LOG =
            LoggerFactory.getLogger(MessageData.class);

    private final BuildData buildData;
    private final SummaryData summaryData;
    private final PhrasesData phrasesData;

    public MessageData(Base base) {
        this.buildData = new BuildData(base);
        this.summaryData = new SummaryData(base);
        this.phrasesData = new PhrasesData(base);
    }

    public Map<String, Object> values() {
        Map<String, Object> data = new HashMap<>();
        LOG.info("Collecting template data");
        data.putAll(buildData.map());
        data.putAll(summaryData.map());
        data.putAll(phrasesData.map());
        LOG.info("Template data: {}", data);
        return data;
    }
}
