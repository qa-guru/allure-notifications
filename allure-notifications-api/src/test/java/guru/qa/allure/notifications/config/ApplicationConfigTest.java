package guru.qa.allure.notifications.config;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

import net.javacrumbs.jsonunit.core.Option;
import net.javacrumbs.jsonunit.core.internal.Options;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junitpioneer.jupiter.ClearSystemProperty;
import org.junitpioneer.jupiter.SetSystemProperty;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.stream.Stream;

import static net.javacrumbs.jsonunit.JsonMatchers.jsonEquals;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ApplicationConfigTest {
    private static final String CONFIG_FILE_PROPERTY = "configFile";

    public static Stream<String> configFiles() {
        return Stream.of(
                "src/test/resources/data/testConfig.json",
                "src/test/resources/data/testConfig_noData.json"
        );
    }

    @Test
    @ClearSystemProperty(key = CONFIG_FILE_PROPERTY)
    void noConfigSpecifiedTest() {
        assertThrows(IllegalArgumentException.class,
                ApplicationConfig::new,
                "'configFile' property is not set or empty: null");
    }

    @Test
    @SetSystemProperty(key = CONFIG_FILE_PROPERTY, value = "wrong/config.path")
    void wrongConfigPathSpecifiedTest() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        assertThrows(FileNotFoundException.class, applicationConfig::readConfig);
    }

    @ParameterizedTest
    @MethodSource("configFiles")
    void noPropertiesAreLoadedTest(String configFilePath) throws IOException {
        String configFromFile = new String(Files.readAllBytes(Paths.get(configFilePath)), StandardCharsets.UTF_8);
        Config config = new ApplicationConfig(configFilePath).readConfig();

        ObjectMapper jsonMapper = new JsonMapper().setSerializationInclusion(Include.NON_NULL);
        String parsedConfig = jsonMapper.writeValueAsString(config);
        assertThat(parsedConfig,
                jsonEquals(configFromFile).withOptions(Options.empty().with(Option.IGNORING_EXTRA_FIELDS)));
    }

    @ParameterizedTest
    @MethodSource("configFiles")
    @SetSystemProperty(key = "notifications.base.environment", value = "environmentOverride")
    @SetSystemProperty(key = "notifications.base.comment", value = "commentOverride")
    @SetSystemProperty(key = "notifications.base.allureFolder", value = "allureFolderOverride")
    @SetSystemProperty(key = "notifications.base.project", value = "projectOverride")
    @SetSystemProperty(key = "notifications.base.reportLink", value = "reportLinkOverride")
    @SetSystemProperty(key = "notifications.base.logo", value = "logoOverride")
    @SetSystemProperty(key = "notifications.base.durationFormat", value = "durationFormatOverride")
    @SetSystemProperty(key = "notifications.base.customData.variable1", value = "customDataOverride_1")
    @SetSystemProperty(key = "notifications.base.customData.variable2", value = "")
    @SetSystemProperty(key = "notifications.base.customData.v", value = "newVariable")
    @SetSystemProperty(key = "notifications.base.customData.", value = "key_can_be_empty")
    @SetSystemProperty(key = "notifications.telegram.token", value = "tokenOverride")
    @SetSystemProperty(key = "notifications.telegram.chat", value = "chatOverride")
    @SetSystemProperty(key = "notifications.telegram.topic", value = "topicOverride")
    @SetSystemProperty(key = "notifications.telegram.replyTo", value = "replyToOverride")
    @SetSystemProperty(key = "notifications.telegram.templatePath", value = "templatePathOverride")
    void propertiesAreOverloadedTest(String configFilePath) throws IOException {
        Config config = new ApplicationConfig(configFilePath).readConfig();

        assertAll(
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
                () -> assertEquals("templatePathOverride", config.getTelegram().getTemplatePath())
                );
    }
}
