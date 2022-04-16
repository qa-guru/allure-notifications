package guru.qa.allure.notifications.config;

import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import guru.qa.allure.notifications.json.JSON;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for config creation.
 */
public class ApplicationConfig {
    private static final ApplicationConfig INSTANCE = new ApplicationConfig();
    private final String configFile = System.getProperty("configFile");

    public static ApplicationConfig newInstance() {
        return INSTANCE;
    }

    public Config readConfig() {
        if (configFile.isEmpty()) {
            throw new ConfigNotFoundException("Unable to parse config " + configFile);
        }
        return new JSON().parse(configFile, Config.class);
    }
}
