package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.config.base.Base;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for markdown template creation.
 */
public class MarkdownTemplate {
    private final Base base;

    public MarkdownTemplate(Base base) {
        this.base = base;
    }

    public String create() {
        return new MessageTemplate(base).of("markdown.ftl");
    }
}
