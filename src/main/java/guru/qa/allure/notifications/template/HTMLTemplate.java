package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.data.MessageData;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for HTML template creation.
 */
public class HTMLTemplate {
    private final MessageData messageData;

    public HTMLTemplate(MessageData messageData) {
        this.messageData = messageData;
    }
    
    public String create() throws MessageBuildException  {
        return new MessageTemplate(messageData).of("html.ftl");
    }
}
