package guru.qa.allure.notifications.template;

import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for markdown template creation.
 */
public class MarkdownTemplate {

    public String create() throws MessageBuildException {
        return new MessageTemplate().of("markdown.ftl");
    }
}
