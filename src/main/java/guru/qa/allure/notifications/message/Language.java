package guru.qa.allure.notifications.message;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class Language {
    public enum Locale {
        en, fr, ru, ua, cn, cnt
    }

    private final Config config;

    public Language(final Locale locale) {
        config = ConfigFactory.parseResources("languages/" + locale + ".json");
    }

    public String getPhrase(final String key) {
        return config.getString("phrases." + key);
    }
}
