package guru.qa.allure.notifications.template;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for HTML template creation.
 */
public class HTMLTemplate {

    public String create() {
        return new MessageTemplate().of("html.ftl");
    }
}
