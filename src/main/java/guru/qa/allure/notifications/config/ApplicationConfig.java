package guru.qa.allure.notifications.config;

import java.io.FileNotFoundException;

import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import guru.qa.allure.notifications.json.JSON;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for config creation.
 */
public class ApplicationConfig {
    private static final ApplicationConfig INSTANCE = new ApplicationConfig();
    private static final String CONFIG_FILE_PROPERTY_NAME = "configFile";
    private final String configFile = System.getProperty(CONFIG_FILE_PROPERTY_NAME);

    private ApplicationConfig() {
    }

    public static ApplicationConfig newInstance() {
        return INSTANCE;
    }

    public Config readConfig() {
        if (configFile == null || configFile.isEmpty()) {
            throw new IllegalArgumentException("'" + CONFIG_FILE_PROPERTY_NAME + "' property is not set or empty: "
                    + configFile);
        }
        try {
            return new JSON().parseFile(configFile, Config.class);
        } catch (FileNotFoundException e) {
            throw new ConfigNotFoundException("Unable to find config file at path " + configFile);
        }
    }
}
