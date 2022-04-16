package guru.qa.allure.notifications.template.config;

import freemarker.template.Configuration;
import guru.qa.allure.notifications.template.MessageTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static freemarker.template.Configuration.VERSION_2_3_31;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for template configuration.
 */
public class TemplateConfig {
    private static final Logger LOG =
            LoggerFactory.getLogger(TemplateConfig.class);

    public Configuration configure() {
        LOG.info("Configuring template engine...");
        final Configuration config =
                new Configuration(VERSION_2_3_31);
        LOG.info("Set directory for templates loading...");
        config.setClassForTemplateLoading(MessageTemplate.class, "/templates");
        LOG.info("Done.");
        LOG.info("Set UTF-8 encoding...");
        config.setDefaultEncoding("UTF-8");
        LOG.info("Done.");
        LOG.info("Configuration is complete.");
        return config;
    }
}
