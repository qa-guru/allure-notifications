package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.data.MessageData;

/**
 * @author GerasimchukDV
 * @since 4.2.2
 * Utility class for KaTeX template creation.
 */
public class RocketTemplate {
    private final MessageData messageData;

    public RocketTemplate(MessageData messageData) {
        this.messageData = messageData;
    }

    public String create() throws MessageBuildException {
        return new MessageTemplate(messageData).of("rocket.ftl");
    }
}
