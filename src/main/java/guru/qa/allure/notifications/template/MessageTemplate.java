package guru.qa.allure.notifications.template;

import freemarker.template.Template;
import freemarker.template.TemplateException;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.config.TemplateConfig;
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.extern.slf4j.Slf4j;

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

    private final Base base;
    private final TemplateConfig templateConfig = new TemplateConfig();

    public MessageTemplate(Base base) {
        this.base = base;
    }

    public String of(String templateFile) throws MessageBuildException {
        log.info("Processing template {}", templateFile);
        Template template;
        try {
            log.info("Parsing template");
            template = templateConfig.configure().getTemplate(templateFile);
        } catch (IOException ex) {
            throw new MessageBuildException(String.format("Unable to parse template %s!", templateFile), ex);
        }
        Writer writer = new StringWriter();
        try {
            log.info("Convert template to string");
            template.process(new MessageData(base).values(), writer);
        } catch (TemplateException | IOException ex) {
            throw new MessageBuildException(String.format("Unable to parse template %s!", templateFile), ex);
        }
        return writer.toString();
    }
}
