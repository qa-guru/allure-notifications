package guru.qa.allure.notifications.config;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junitpioneer.jupiter.ClearSystemProperty;
import org.junitpioneer.jupiter.SetSystemProperty;

import java.io.IOException;
import java.util.HashMap;
import java.util.Properties;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ApplicationConfigTest {
    private static final String CONFIG_FILE_PROPERTY = "configFile";

    private ObjectMapper jsonObjectMapper;

    public static Stream<String> differentConfigs() {
        return Stream.of(
                "src/test/resources/data/testConfig.json",
                "src/test/resources/data/testConfig_noData.json"
        );
    }

    @BeforeEach
    void setUp() {
        this.jsonObjectMapper = JsonMapper.builder()
                .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
                .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
                .build();
    }

    @Test
    @ClearSystemProperty(key = CONFIG_FILE_PROPERTY)
    void noConfigSpecifiedTest() {
        System.clearProperty(CONFIG_FILE_PROPERTY);

        assertThrows(IllegalArgumentException.class,
                ApplicationConfig::new,
                "'configFile' property is not set or empty: null");
    }

    @Test
    @SetSystemProperty(key = CONFIG_FILE_PROPERTY, value = "wrong/config.path")
    void wrongConfigPathSpecifiedTest() {
        assertThrows(ConfigNotFoundException.class,
                () -> new ApplicationConfig().readConfig(),
                "Unable to find config file at path wrong/config.path");
    }

    @ParameterizedTest
    @MethodSource("differentConfigs")
    void noPropertiesAreLoadedTest(String configFilePath) throws IOException {
        Config config = new ApplicationConfig(configFilePath).readConfig();

        String configStringBefore = jsonObjectMapper.writeValueAsString(config);

        config = ApplicationConfig.apply(config, new Properties());

        String configStringAfter = jsonObjectMapper.writeValueAsString(config);

        assertEquals(configStringBefore, configStringAfter);
    }

    @ParameterizedTest
    @MethodSource("differentConfigs")
    void propertiesAreOverloadedTest(String configFilePath) {
        Config config = ApplicationConfig.apply(new ApplicationConfig(configFilePath).readConfig(), new Properties() {
            {
                put("base.environment", "environmentOverride");
                put("base.comment", "commentOverride");
                put("base.allureFolder", "allureFolderOverride");
                put("base.project", "projectOverride");
                put("base.reportLink", "reportLinkOverride");
                put("base.logo", "logoOverride");
                put("base.durationFormat", "durationFormatOverride");

                put("telegram.token", "tokenOverride");
                put("telegram.chat", "chatOverride");
                put("telegram.topic", "topicOverride");
                put("telegram.replyTo", "replyToOverride");
                put("telegram.templatePath", "templatePathOverride");

                put("skype.appId", "appIdOverride");

                put("base.customData.variable1", "customDataOverride_1");
                put("base.customData.variable2", "");
                put("base.customData.v", "newVariable");
                put("base.customData.", "key_can_be_empty");
            }
        });

        Assertions.assertAll(
                () -> assertEquals("environmentOverride", config.getBase().getEnvironment()),
                () -> assertEquals("commentOverride", config.getBase().getComment()),
                () -> assertEquals("allureFolderOverride", config.getBase().getAllureFolder()),
                () -> assertEquals("projectOverride", config.getBase().getProject()),
                () -> assertEquals("reportLinkOverride", config.getBase().getReportLink()),
                () -> assertEquals("logoOverride", config.getBase().getLogo()),
                () -> assertEquals("durationFormatOverride", config.getBase().getDurationFormat()),
                () -> assertEquals(new HashMap<String, String>() {
                    {
                        put("variable1", "customDataOverride_1");
                        put("variable2", "");
                        put("v", "newVariable");
                        put("", "key_can_be_empty");
                    }
                }, config.getBase().getCustomData()),

                () -> assertEquals("tokenOverride", config.getTelegram().getToken()),
                () -> assertEquals("chatOverride", config.getTelegram().getChat()),
                () -> assertEquals("topicOverride", config.getTelegram().getTopic()),
                () -> assertEquals("replyToOverride", config.getTelegram().getReplyTo()),
                () -> assertEquals("templatePathOverride", config.getTelegram().getTemplatePath()),

                () -> assertEquals("appIdOverride", config.getSkype().getAppId()))
        ;
    }
}