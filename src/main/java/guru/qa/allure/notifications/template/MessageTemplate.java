package guru.qa.allure.notifications.template;

import freemarker.template.Template;
import freemarker.template.TemplateException;
import guru.qa.allure.notifications.template.config.TemplateConfig;
import guru.qa.allure.notifications.template.data.MessageData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for template parsing.
 */
public class MessageTemplate {
    private static final Logger LOG =
            LoggerFactory.getLogger(MessageTemplate.class);

    private final TemplateConfig templateConfig = new TemplateConfig();

    public String of(String templateFile) {
        LOG.info("Processing template {}", templateFile);
        Template template = null;
        try {
            LOG.info("Parsing template");
            template = templateConfig.configure().getTemplate(templateFile);
        } catch (IOException ex) {
            LOG.info("Unable to parse template {}! Reason: {}", templateFile,
                    ex.getMessage());
            System.exit(1);
        }
        Writer writer = new StringWriter();
        try {
            LOG.info("Convert template to string");
            template.process(new MessageData().values(), writer);
        } catch (TemplateException | IOException ex) {
            LOG.info("Unable to parse template {}! Reason: {}", templateFile,
                    ex.getMessage());
            System.exit(1);
        }
        return writer.toString();
    }
}
