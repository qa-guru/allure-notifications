package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping legend *.json to Legend object.
 */
public class LegendMapper {

    private final Base base;

    public LegendMapper(Base base) {
        this.base = base;
    }

    public Legend map() {
        String legendJson = "/legend/" + base.getLanguage() + ".json";
        return new JSON().parseResource(legendJson, Legend.class);
    }
}
