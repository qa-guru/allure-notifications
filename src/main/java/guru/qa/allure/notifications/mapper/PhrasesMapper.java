package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
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

    public Phrases map() {
        String lang = ApplicationConfig.newInstance()
                .readConfig().base().language() + ".json";
        String fullPath = this.getClass().getClassLoader().getResource("phrases/" + lang).getFile();
        LOG.info("Mapping {} to Phrases object", fullPath);
        return new JSON().parse(fullPath, Phrases.class);
    }
}
