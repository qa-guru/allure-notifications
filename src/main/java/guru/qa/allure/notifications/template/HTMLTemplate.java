package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;

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
    
    public String create(String template) throws MessageBuildException  {
        return new MessageTemplate(base).of(template);
    }
}
