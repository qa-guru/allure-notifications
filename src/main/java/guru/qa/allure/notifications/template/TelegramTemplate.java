package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * Utility class for telegram html template creation.
 */
public class TelegramTemplate {
    private final Base base;

    public TelegramTemplate(Base base) {
        this.base = base;
    }

    public String create() throws MessageBuildException {
        return new MessageTemplate(base).of("telegram.ftl");
    }
}
