package guru.qa.allure.notifications.template;

import static freemarker.template.Configuration.VERSION_2_3_31;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for template parsing.
 */
@Slf4j
public class MessageTemplate {

    public static String createMessageFromTemplate(MessageData messageData, String templatePath)
            throws MessageBuildException {
        try (Writer writer = new StringWriter()) {
            log.info("Processing template {}", templatePath);
            Template template = getTemplate(templatePath);
            log.info("Generating message using template");
            template.process(messageData.getValues(), writer);
            return writer.toString();
        } catch (TemplateException | IOException ex) {
            throw new MessageBuildException(String.format("Unable to parse template %s!", templatePath), ex);
        }
    }

    private static Template getTemplate(String templatePath) throws IOException {
        final Configuration config = new Configuration(VERSION_2_3_31);
        config.setDefaultEncoding("UTF-8");

        File templateAsFile = new File(templatePath);
        if (templateAsFile.exists()) {
            config.setDirectoryForTemplateLoading(templateAsFile.getParentFile());
            return config.getTemplate(templateAsFile.getName());
        } else {
            config.setClassForTemplateLoading(MessageTemplate.class, "/");
            return config.getTemplate(templatePath);
        }
    }
}
