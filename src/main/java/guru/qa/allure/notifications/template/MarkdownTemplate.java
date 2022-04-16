package guru.qa.allure.notifications.template;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for markdown template creation.
 */
public class MarkdownTemplate {

    public String create() {
        return new MessageTemplate().of("markdown.ftl");
    }
}
