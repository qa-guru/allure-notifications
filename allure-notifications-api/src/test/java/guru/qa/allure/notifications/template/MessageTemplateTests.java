package guru.qa.allure.notifications.template;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;

import freemarker.template.Configuration;
import freemarker.template.Template;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
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
}
