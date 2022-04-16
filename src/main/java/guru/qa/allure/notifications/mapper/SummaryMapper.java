package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping summary.json to Summary object.
 */
public class SummaryMapper {
    private static final Logger LOG =
            LoggerFactory.getLogger(SummaryMapper.class);
    private static final String SUMMARY = "widgets/summary.json";

    public Summary map() {
        LOG.info("Mapping {} to Summary object", SUMMARY);
        String allureFolder = ApplicationConfig.newInstance().readConfig()
                .base().allureFolder();
        String fullPath = allureFolder + SUMMARY;
        return new JSON().parse(fullPath, Summary.class);
    }
}
