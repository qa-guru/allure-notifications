package guru.qa.allure.notifications.mapper;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.UncheckedIOException;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping summary.json to Summary object.
 */
public class SummaryMapper {
    private final Base base;

    public SummaryMapper(Base base) {
        this.base = base;
    }

    public Summary map() {
        File summaryJsonFile = new File(base.getAllureFolder(), "widgets/summary.json");
        try {
            return new JSON().parseFile(summaryJsonFile, Summary.class);
        } catch (FileNotFoundException e) {
            throw new UncheckedIOException(e);
        }
    }
}
