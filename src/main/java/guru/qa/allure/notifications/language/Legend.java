package guru.qa.allure.notifications.language;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class Legend {
    private final Config config;

    public Legend(final Locale locale) {
        config = ConfigFactory.parseResources("legend/" + locale + ".json");
    }

    public String getLegend(final String key) {
        return config.getString("legend." + key);
    }
}
