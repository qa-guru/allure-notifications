package guru.qa.allure.notifications.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.dataformat.javaprop.JavaPropsMapper;
import com.fasterxml.jackson.dataformat.javaprop.JavaPropsSchema;

import java.io.FileReader;
import java.io.IOException;
import java.util.Map;

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

    public Config readConfig() throws IOException {
        Config config = new JsonMapper().readValue(new FileReader(configFile), Config.class);
        mergeWithSystemProperties(config);
        return config;
    }

    private static void mergeWithSystemProperties(Config config) throws IOException {
        JavaPropsMapper javaPropsMapper = JavaPropsMapper.builder()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .build();

        try (JsonParser parser = javaPropsMapper.getFactory().createParser((Map<?, ?>) System.getProperties())) {
            parser.setSchema(JavaPropsSchema.emptySchema().withPrefix("notifications"));
            javaPropsMapper.readerForUpdating(config).readValue(parser, Config.class);
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
