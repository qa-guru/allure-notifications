package guru.qa.allure.notifications.message;

import freemarker.template.Configuration;
import freemarker.template.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.StringWriter;
import java.io.Writer;

import static freemarker.template.Configuration.VERSION_2_3_31;

public class MessageText {
    private static final Logger LOG = LoggerFactory.getLogger("Message");

    /** Возвращает отформатированное по шаблону сообщение в Markdown формате. */
    public static String markdown() {
        return template("markdown.ftl");
    }

    /** Возвращает отформатированное по шаблону сообщение в HTML формате. */
    public static String html() {
        return template("html.ftl");
    }

    private static String template(final String file) {
        LOG.info("Processing template...");
        Template template = null;
        try {
            LOG.info("Loading template...");
            template = configure().getTemplate(file);
            LOG.info("Done.");
        } catch (Exception ex) {
            LOG.error("Template {} not found!", file);
            System.exit(1);
        }
        Writer writer = new StringWriter();
        try {
            LOG.info("Reading template data to string...");
            template.process(MessageData.values(), writer);
            LOG.info("Done.");
        } catch (Exception ex) {
            LOG.error("Invalid template data!");
            System.exit(1);
        }
        return writer.toString();
    }

    private static Configuration configure() {
        LOG.info("Configuring template engine...");
        final Configuration config = new Configuration(VERSION_2_3_31);
        LOG.info("Set directory for templates loading...");
        config.setClassForTemplateLoading(MessageText.class, "/templates");
        LOG.info("Done.");
        LOG.info("Set UTF-8 encoding...");
        config.setDefaultEncoding("UTF-8");
        LOG.info("Done.");
        LOG.info("Configuration is complete.");
        return config;
    }
}
