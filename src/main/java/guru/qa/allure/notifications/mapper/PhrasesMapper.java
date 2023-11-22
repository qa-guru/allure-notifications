package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping phrases *.json to Phrases object.
 */
public class PhrasesMapper {

    private final Base base;

    public PhrasesMapper(Base base) {
        this.base = base;
    }

    public Phrases map() {
        String phrasesJson = "/phrases/" + base.getLanguage() + ".json";
        return new JSON().parseResource(phrasesJson, Phrases.class);
    }
}
