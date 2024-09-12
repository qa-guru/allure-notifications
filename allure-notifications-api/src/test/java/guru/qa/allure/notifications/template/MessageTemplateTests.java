package guru.qa.allure.notifications.template;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;

import freemarker.template.Configuration;
import freemarker.template.Template;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.template.config.TemplateConfig;
import guru.qa.allure.notifications.template.data.MessageData;

@ExtendWith(MockitoExtension.class)
class MessageTemplateTests {
    public static final String FILE_NAME = "testTemplate.ftl";

    public static final String FILESYSTEM_PATH = "guru/qa/allure/notifications/template/" + FILE_NAME;
    public static final String RESOURCES_PATH = "/templates/" + FILE_NAME;

    @Mock private MessageData messageData;
    @Mock private Configuration configuration;
    @Mock private Template template;

    @Test
    void shouldCreateMessageFromTemplateFromFileSystem() throws MessageBuildException, IOException {
        try (MockedConstruction<TemplateConfig> configMock = mockConstruction(TemplateConfig.class,
                (mock, context) -> when(mock.configure(any())).thenReturn(configuration))) {
            String fileSystemPath = ClassLoader.getSystemResource(FILESYSTEM_PATH).getFile();
            when(configuration.getTemplate(FILE_NAME)).thenReturn(template);
            when(messageData.getValues()).thenReturn(new HashMap<>());
            MessageTemplate messageTemplate = new MessageTemplate(messageData);
            messageTemplate.createMessageFromTemplate(fileSystemPath);

            TemplateConfig templateConfig = configMock.constructed().get(0);
            verify(templateConfig).configure(argThat(f ->
                    new File(fileSystemPath).toString().equals(f.get().toString())));
            verify(configuration).getTemplate(FILE_NAME);
        }
    }

    @Test
    void shouldCreateMessageFromTemplateFromJar() throws MessageBuildException, IOException {
        try (MockedConstruction<TemplateConfig> configMock = mockConstruction(TemplateConfig.class,
                (mock, context) -> when(mock.configure(any())).thenReturn(configuration))) {
            when(configuration.getTemplate(RESOURCES_PATH)).thenReturn(template);
            when(messageData.getValues()).thenReturn(new HashMap<>());
            MessageTemplate messageTemplate = new MessageTemplate(messageData);
            messageTemplate.createMessageFromTemplate(RESOURCES_PATH);

            TemplateConfig templateConfig = configMock.constructed().get(0);
            verify(templateConfig).configure(Optional.empty());
            verify(configuration).getTemplate(RESOURCES_PATH);
        }
    }

    @ParameterizedTest
    @CsvSource({
            "templates/html.ftl,     guru/qa/allure/notifications/template/messages/html.txt",
            "templates/markdown.ftl, guru/qa/allure/notifications/template/messages/markdown.txt",
            "templates/rocket.ftl,   guru/qa/allure/notifications/template/messages/rocket.txt",
            "templates/telegram.ftl, guru/qa/allure/notifications/template/messages/telegram.txt"
    })
    void shouldValidateGeneratedMessageFromTemplate(String templatePath, String expectedMessagePath)
            throws IOException, URISyntaxException, MessageBuildException {
        Config config = new JSON().parseResource(
                "/guru/qa/allure/notifications/template/testConfig.json", Config.class);
        Summary summary = new JSON().parseResource(
                "/guru/qa/allure/notifications/template/testSummary.json", Summary.class);
        ClassLoader classLoader = getClass().getClassLoader();
        URL testSuitesUrl = classLoader.getResource("guru/qa/allure/notifications/template/testSuites.json");
        String suitesSummaryJson = new String(Files.readAllBytes(Paths.get(testSuitesUrl.toURI())), UTF_8);
        Phrases phrases = new JSON().parseResource("/phrases/en.json", Phrases.class);

        MessageData testMessageData = new MessageData(config.getBase(), summary, suitesSummaryJson, phrases);
        MessageTemplate messageTemplate = new MessageTemplate(testMessageData);

        String messageGeneratedFromTemplate = messageTemplate.createMessageFromTemplate(templatePath);
        URL expectedMessageUrl = classLoader.getResource(expectedMessagePath);
        String expectedMessage = new String(Files.readAllBytes(Paths.get(expectedMessageUrl.toURI())), UTF_8);
        assertEquals(expectedMessage, messageGeneratedFromTemplate);
    }
}
