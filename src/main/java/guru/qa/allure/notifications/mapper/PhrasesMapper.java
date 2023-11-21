package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.util.ResourcesUtil;
import lombok.extern.slf4j.Slf4j;
/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping phrases *.json to Phrases object.
 */

@Slf4j
public class PhrasesMapper {

    private final Base base;

    public PhrasesMapper(Base base) {
        this.base = base;
    }

    public Phrases map() {
        String lang = base.getLanguage() + ".json";
        String fullPath = new ResourcesUtil()
                .resourcesPath("/phrases/" + lang);
        log.info("Mapping {} to Phrases object", fullPath);
        return new JSON().parse(fullPath, Phrases.class);
    }
}
