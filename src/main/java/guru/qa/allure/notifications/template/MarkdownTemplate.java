package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.template.data.MessageData;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for markdown template creation.
 */
public class MarkdownTemplate {
    private final MessageData messageData;

    public MarkdownTemplate(MessageData messageData) {
        this.messageData = messageData;
    }

    public String create() throws MessageBuildException {
        return new MessageTemplate(messageData).of("markdown.ftl");
    }
}
