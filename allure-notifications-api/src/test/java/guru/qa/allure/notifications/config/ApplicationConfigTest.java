package guru.qa.allure.notifications.config;

import guru.qa.allure.notifications.exceptions.ConfigNotFoundException;
import kong.unirest.JsonObjectMapper;
import org.assertj.core.api.SoftAssertions;
import org.assertj.core.api.junit.jupiter.InjectSoftAssertions;
import org.assertj.core.api.junit.jupiter.SoftAssertionsExtension;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.HashMap;
import java.util.Properties;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SoftAssertionsExtension.class)
class ApplicationConfigTest {
    private static final String CONFIG_FILE_PROPERTY = "configFile";
    private static String propertyValue;

    @InjectSoftAssertions
    private SoftAssertions soft;

    private JsonObjectMapper jsonObjectMapper;

    @BeforeAll
    static void beforeAll() {
        propertyValue = System.getProperty(CONFIG_FILE_PROPERTY);
    }

    @AfterAll
    static void afterAll() {
        if (propertyValue != null) {
            System.setProperty(CONFIG_FILE_PROPERTY, propertyValue);
        }
    }

    public static Stream<String> differentConfigs() {
        return Stream.of(
                "src/test/resources/data/testConfig.json",
                "src/test/resources/data/testConfig_noData.json"
        );
    }

    @BeforeEach
    void setUp() {
        this.jsonObjectMapper = new JsonObjectMapper();
    }

    @Test
    void noConfigSpecifiedTest() {
        System.clearProperty(CONFIG_FILE_PROPERTY);

        soft.assertThatException()
                .isThrownBy(ApplicationConfig::new)
                .withMessage("'configFile' property is not set or empty: null")
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void wrongConfigPathSpecifiedTest() {
        System.setProperty("configFile", "wrong/config.path");

        soft.assertThatException()
                .isThrownBy(() -> new ApplicationConfig().readConfig())
                .withMessage("Unable to find config file at path wrong/config.path")
                .isInstanceOf(ConfigNotFoundException.class);
    }

    @ParameterizedTest
    @MethodSource("differentConfigs")
    void noPropertiesAreLoadedTest(String configFilePath) {
        Config config = new ApplicationConfig(configFilePath).readConfig();

        String configStringBefore = jsonObjectMapper.writeValue(config);

        ApplicationConfig.apply(config, new Properties());

        String configStringAfter = jsonObjectMapper.writeValue(config);

        assertThat(configStringAfter).isEqualTo(configStringBefore);
    }

    @ParameterizedTest
    @MethodSource("differentConfigs")
    void propertiesAreOverloadedTest(String configFilePath) {
        Config config = new ApplicationConfig(configFilePath).readConfig();

        ApplicationConfig.apply(config, new Properties() {
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

                put("base.customData.variable1", "customDataOverride_1");
                put("base.customData.variable2", "");
                put("base.customData.v", "newVariable");
                put("base.customData.", "key_can_not_be_empty");
            }
        });

        soft.assertThat(config)
                .returns("environmentOverride", c -> c.getBase().getEnvironment())
                .returns("commentOverride", c -> c.getBase().getComment())
                .returns("allureFolderOverride", c -> c.getBase().getAllureFolder())
                .returns("projectOverride", c -> c.getBase().getProject())
                .returns("reportLinkOverride", c -> c.getBase().getReportLink())
                .returns("logoOverride", c -> c.getBase().getLogo())
                .returns("durationFormatOverride", c -> c.getBase().getDurationFormat())
                .returns(new HashMap<String, String>() {
                    {
                        put("variable1", "customDataOverride_1");
                        put("variable2", "");
                        put("v", "newVariable");
                    }
                }, c -> c.getBase().getCustomData())

                .returns("tokenOverride", c -> c.getTelegram().getToken())
                .returns("chatOverride", c -> c.getTelegram().getChat())
                .returns("topicOverride", c -> c.getTelegram().getTopic())
                .returns("replyToOverride", c -> c.getTelegram().getReplyTo())
                .returns("templatePathOverride", c -> c.getTelegram().getTemplatePath())
        ;
    }
}