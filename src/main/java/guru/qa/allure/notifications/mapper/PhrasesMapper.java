package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.util.ResourcesUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping phrases *.json to Phrases object.
 */
public class PhrasesMapper {
    private static final Logger LOG =
            LoggerFactory.getLogger(PhrasesMapper.class);

    private final Base base;

    public PhrasesMapper(Base base) {
        this.base = base;
    }

    public Phrases map() {
        String lang = base.language() + ".json";
        String fullPath = new ResourcesUtil()
                .resourcesPath("/phrases/" + lang);
        LOG.info("Mapping {} to Phrases object", fullPath);
        return new JSON().parse(fullPath, Phrases.class);
    }
}
