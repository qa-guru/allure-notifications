package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.data.MessageData;

/**
 * Utility class for telegram html template creation.
 */
public class TelegramTemplate {
    private final MessageData messageData;

    public TelegramTemplate(MessageData messageData) {
        this.messageData = messageData;
    }

    public String create() throws MessageBuildException {
        return new MessageTemplate(messageData).of("telegram.ftl");
    }
}
