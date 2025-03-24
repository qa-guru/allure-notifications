package guru.qa.allure.notifications.config;

import com.fasterxml.jackson.dataformat.javaprop.JavaPropsMapper;
import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import guru.qa.allure.notifications.json.JSON;
import lombok.SneakyThrows;

import java.io.FileNotFoundException;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

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

    @SneakyThrows
    public static Config apply(Config config, Properties properties) {
        JavaPropsMapper javaPropsMapper = new JavaPropsMapper();

        Properties propertiesFromConfig = javaPropsMapper.writeValueAsProperties(config);

        //remove default keys with empty strings to avoid default values from pojo fields, e.g. Slack.template path
        //may be default values are the feature and such filtration should be removed
        propertiesFromConfig.entrySet().stream()
                .filter(x -> x.getValue() == null || x.getValue().toString().isEmpty())
                .map(Map.Entry::getKey)
                .collect(Collectors.<Object>toSet())
                .forEach(propertiesFromConfig::remove);

        propertiesFromConfig.putAll(properties);

        return javaPropsMapper.readPropertiesAs(propertiesFromConfig, Config.class);
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
}
