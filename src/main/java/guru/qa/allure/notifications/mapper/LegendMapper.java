package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.util.ResourcesUtil;
import lombok.extern.slf4j.Slf4j;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping legend *.json to Legend object.
 */
@Slf4j
public class LegendMapper {

    private final Base base;

    public LegendMapper(Base base) {
        this.base = base;
    }

    public Legend map() {
        String lang = base.getLanguage() + ".json";
        String fullPath = new ResourcesUtil()
                .resourcesPath("/legend/" + lang);
        log.info("Mapping {} to Legend object", fullPath);
        return new JSON().parse(fullPath, Legend.class);
    }
}
