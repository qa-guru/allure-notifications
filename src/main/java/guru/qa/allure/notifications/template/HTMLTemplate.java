package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.config.base.Base;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for HTML template creation.
 */
public class HTMLTemplate {
    private final Base base;

    public HTMLTemplate(Base base) {
        this.base = base;
    }

    public String create() {
        return new MessageTemplate(base).of("html.ftl");
    }
}
