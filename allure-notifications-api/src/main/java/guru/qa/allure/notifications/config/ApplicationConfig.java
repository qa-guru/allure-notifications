package guru.qa.allure.notifications.config;

import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import guru.qa.allure.notifications.json.JSON;
import org.apache.commons.lang3.tuple.Pair;

import java.io.FileNotFoundException;
import java.util.Properties;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * @author kadehar
 * @since 1.0
 * Utility class for config creation.
 */
public class ApplicationConfig {
    private static final String CONFIG_FILE_PROPERTY_NAME = "configFile";

    private final String configFile;

    public ApplicationConfig(String configFile) {
        this.configFile = configFile;
    }

    public ApplicationConfig() {
        this(getConfigFile());
    }

    public static void apply(Config config, Properties properties) {
        applySystemProperty(properties, "base.project", config.getBase()::setProject);
        applySystemProperty(properties, "base.environment", config.getBase()::setEnvironment);
        applySystemProperty(properties, "base.comment", config.getBase()::setComment);
        applySystemProperty(properties, "base.reportLink", config.getBase()::setReportLink);
        applySystemProperty(properties, "base.logo", config.getBase()::setLogo);
        applySystemProperty(properties, "base.allureFolder", config.getBase()::setAllureFolder);
        applySystemProperty(properties, "base.durationFormat", config.getBase()::setDurationFormat);

        applySystemPropertyMap(properties, "base.customData.", config.getBase()::addCustomData);

        applySystemProperty(properties, "telegram.token", config.getTelegram()::setToken);
        applySystemProperty(properties, "telegram.chat", config.getTelegram()::setChat);
        applySystemProperty(properties, "telegram.topic", config.getTelegram()::setTopic);
        applySystemProperty(properties, "telegram.replyTo", config.getTelegram()::setReplyTo);
        applySystemProperty(properties, "telegram.templatePath", config.getTelegram()::setTemplatePath);
    }

    public Config readConfig() {
        try {
            return new JSON().parseFile(configFile, Config.class);
        } catch (FileNotFoundException e) {
            throw new ConfigNotFoundException("Unable to find config file at path " + configFile);
        }
    }

    private static String getConfigFile() {
        String configFile = System.getProperty(CONFIG_FILE_PROPERTY_NAME);

        if (configFile == null || configFile.isEmpty()) {
            throw new IllegalArgumentException("'" + CONFIG_FILE_PROPERTY_NAME + "' property is not set or empty: "
                    + configFile);
        }

        return configFile;
    }

    private static void applySystemProperty(Properties properties, String name, Consumer<String> consumer) {
        Object o = properties.get(name);
        if (o != null) {
            consumer.accept((String) o);
        }
    }

    private static void applySystemPropertyMap(Properties properties, String prefix,
                                               BiConsumer<String, String> consumer) {
        properties.entrySet().stream()
                .map(e -> Pair.of(String.valueOf(e.getKey()), String.valueOf(e.getValue())))
                .filter(e -> e.getKey().startsWith(prefix))
                .map(e -> Pair.of(e.getKey().substring(prefix.length()), e.getValue()))
                .filter(e -> !e.getKey().isEmpty())
                .forEach(e -> consumer.accept(e.getKey(), e.getValue()));
    }
}
