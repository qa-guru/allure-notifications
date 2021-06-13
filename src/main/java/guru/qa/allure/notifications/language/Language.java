package guru.qa.allure.notifications.language;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class Language {
    private final Config config;

    public Language(final Locale locale) {
        config = ConfigFactory.parseResources("languages/" + locale + ".json");
    }

    public String getPhrase(final String key) {
        return config.getString("phrases." + key);
    }
}
