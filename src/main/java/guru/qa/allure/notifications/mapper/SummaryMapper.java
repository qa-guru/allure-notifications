package guru.qa.allure.notifications.mapper;

import java.io.File;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;
import lombok.extern.slf4j.Slf4j;
/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping summary.json to Summary object.
 */
@Slf4j
public class SummaryMapper {
    private static final String SUMMARY = "widgets/summary.json";
    private final Base base;

    public SummaryMapper(Base base) {
        this.base = base;
    }

    public Summary map() {
        log.info("Mapping {} to Summary object", SUMMARY);
        String fullPath = new File(base.getAllureFolder(), SUMMARY).getAbsolutePath();
        return new JSON().parse(fullPath, Summary.class);
    }
}
