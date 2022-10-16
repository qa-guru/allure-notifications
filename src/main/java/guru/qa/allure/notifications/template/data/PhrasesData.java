package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.mapper.PhrasesMapper;
import guru.qa.allure.notifications.model.phrases.Phrases;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping phrases data for template.
 */
@Slf4j
public class PhrasesData implements TemplateData {
    private final PhrasesMapper phrasesMapper;

    public PhrasesData(Base base) {
        this.phrasesMapper = new PhrasesMapper(base);
    }

    @Override
    public Map<String, Object> map() {
        log.info("Collecting phrases data for template");

        Phrases phrases = phrasesMapper.map();

        Map<String, Object> info = new HashMap<>();
        info.put("results", phrases.getResults());
        info.put("environment", phrases.getEnvironment());
        info.put("comment", phrases.getComment());
        info.put("reportAvailableAtLink", phrases.getReportAvailableAtLink());
        info.put("duration", phrases.getScenario().getDuration());
        info.put("totalScenarios", phrases.getScenario().getTotalScenarios());
        info.put("totalPassed", phrases.getScenario().getTotalPassed());
        info.put("totalFailed", phrases.getScenario().getTotalFailed());
        info.put("totalBroken", phrases.getScenario().getTotalBroken());
        info.put("totalUnknown", phrases.getScenario().getTotalUnknown());
        info.put("totalSkipped", phrases.getScenario().getTotalSkipped());
        log.info("Phrases data: {}", info);
        return info;
    }
}
