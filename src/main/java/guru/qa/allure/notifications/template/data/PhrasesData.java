package guru.qa.allure.notifications.template.data;

import guru.qa.allure.notifications.mapper.PhrasesMapper;
import guru.qa.allure.notifications.model.phrases.Phrases;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping phrases data for template.
 */
public class PhrasesData implements TemplateData {
    private static final Logger LOG =
            LoggerFactory.getLogger(PhrasesData.class);
    private final Phrases phrases = new PhrasesMapper().map();

    @Override
    public Map<String, Object> map() {
        LOG.info("Collecting phrases data for template");
        Map<String, Object> info = new HashMap<>();
        info.put("results", phrases.results());
        info.put("environment", phrases.environment());
        info.put("comment", phrases.comment());
        info.put("reportAvailableByLink", phrases.reportAvailableByLink());
        info.put("duration", phrases.scenario().duration());
        info.put("totalScenarios", phrases.scenario().totalScenarios());
        info.put("totalPassed", phrases.scenario().totalPassed());
        info.put("totalFailed", phrases.scenario().totalFailed());
        info.put("totalBroken", phrases.scenario().totalBroken());
        info.put("totalUnknown", phrases.scenario().totalUnknown());
        info.put("totalSkipped", phrases.scenario().totalSkipped());
        info.put("ofPassedTests", phrases.scenario().percentOfPassedTests());
        info.put("ofFailedTests", phrases.scenario().percentOfFailedTests());
        LOG.info("Phrases data: {}", info);
        return info;
    }
}
