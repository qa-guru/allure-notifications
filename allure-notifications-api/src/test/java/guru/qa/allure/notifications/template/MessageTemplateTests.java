package guru.qa.allure.notifications.template;

import static java.lang.ClassLoader.getSystemResource;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.template.data.MessageData;

class MessageTemplateTests {

    static Stream<Arguments> testData() {
        return Stream.of(
                arguments("templates/html.ftl", "messages/html.txt"),
                arguments("templates/markdown.ftl", "messages/markdown.txt"),
                arguments("templates/rocket.ftl", "messages/rocket.txt"),
                arguments("templates/telegram.ftl", "messages/telegram.txt"),
                arguments("template/testTemplateAsResource.ftl", "messages/customHtml.txt"),
                arguments(getSystemResource("template/testTemplateAsFile.ftl").getFile(), "messages/customHtml.txt")
        );
    }

    @ParameterizedTest
    @MethodSource("testData")
    void shouldValidateGeneratedMessageFromTemplate(String templatePath, String expectedMessagePath)
            throws IOException, URISyntaxException, MessageBuildException {

        Config config = new JSON().parseResource("/data/testConfig.json", Config.class);
        Summary summary = new JSON().parseResource("/data/testSummary.json", Summary.class);
        String suitesSummaryJson = readResource("data/testSuites.json");
        Phrases phrases = new JSON().parseResource("/phrases/en.json", Phrases.class);

        MessageData messageData = new MessageData(config.getBase(), summary, suitesSummaryJson, phrases);

        String messageGeneratedFromTemplate = MessageTemplate.createMessageFromTemplate(messageData, templatePath);
        String expectedMessage = readResource(expectedMessagePath);
        assertEquals(expectedMessage, messageGeneratedFromTemplate);
    }

    private String readResource(String name) throws IOException, URISyntaxException {
        URL resourceUrl = getClass().getClassLoader().getResource(name);
        return new String(Files.readAllBytes(Paths.get(resourceUrl.toURI())), UTF_8);
    }
}
