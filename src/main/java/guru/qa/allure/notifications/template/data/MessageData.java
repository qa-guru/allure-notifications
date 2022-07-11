package guru.qa.allure.notifications.template.data;

import java.util.HashMap;
import java.util.Map;

import guru.qa.allure.notifications.config.base.Base;
import lombok.extern.slf4j.Slf4j;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for mapping template data for template.
 */
@Slf4j
public class MessageData {

    private Map<String, Object> data;

    public MessageData(Base base) {
        this.data = new HashMap<>();
        log.info("Collecting template data");
        this.data.putAll(new BuildData(base).map());
        this.data.putAll(new SummaryData(base).map());
        this.data.putAll(new PhrasesData(base).map());
        log.info("Template data: {}", data);
    }

    public Map<String, Object> getValues() {
        return data;
    }
}
