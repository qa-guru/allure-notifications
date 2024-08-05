package guru.qa.allure.notifications.template.config;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

import freemarker.template.Configuration;
import guru.qa.allure.notifications.template.MessageTemplate;
import lombok.extern.slf4j.Slf4j;

import static freemarker.template.Configuration.VERSION_2_3_31;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for template configuration.
 */
@Slf4j
public class TemplateConfig {

    public Configuration configure(Optional<File> template) throws IOException {
        log.info("Configuring template engine...");
        final Configuration config =
                new Configuration(VERSION_2_3_31);
        log.info("Set directory for templates loading...");
        if (template.isPresent()) {
            config.setDirectoryForTemplateLoading(template.get().getParentFile());
        }
        else {
            config.setClassForTemplateLoading(MessageTemplate.class, "/");
        }
        log.info("Done.");
        log.info("Set UTF-8 encoding...");
        config.setDefaultEncoding("UTF-8");
        log.info("Done.");
        log.info("Configuration is complete.");
        return config;
    }
}
