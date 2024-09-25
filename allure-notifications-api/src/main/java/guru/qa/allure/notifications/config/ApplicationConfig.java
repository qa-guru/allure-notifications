package guru.qa.allure.notifications.config;

import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import guru.qa.allure.notifications.json.JSON;

import java.io.FileNotFoundException;
import java.util.Properties;
import java.util.function.Consumer;

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

    public static void apply(Config config, Properties properties) {
        applySystemProperty(properties, "base.environment", config.getBase()::setEnvironment);
        applySystemProperty(properties, "base.comment", config.getBase()::setComment);
        applySystemProperty(properties, "base.allureFolder", config.getBase()::setAllureFolder);
        applySystemProperty(properties, "base.project", config.getBase()::setProject);
        applySystemProperty(properties, "base.reportLink", config.getBase()::setReportLink);
        applySystemProperty(properties, "base.logo", config.getBase()::setLogo);
        applySystemProperty(properties, "telegram.token", config.getTelegram()::setToken);
        applySystemProperty(properties, "telegram.chat", config.getTelegram()::setChat);
        applySystemProperty(properties, "telegram.topic", config.getTelegram()::setTopic);
        applySystemProperty(properties, "telegram.replyTo", config.getTelegram()::setReplyTo);
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

    private static void applySystemProperty(Properties properties, String name, Consumer<String> consumer) {
        Object o = properties.get(name);
        if (o != null) {
            consumer.accept((String)o);
        }
    }
}
