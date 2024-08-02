package guru.qa.allure.notifications.exceptions;

/**
 * @author kadehar
 * @since 4.0
 * Throws if unable to find config file.
 */
public class ConfigNotFoundException extends RuntimeException {
    public ConfigNotFoundException(String message) {
        super(message);
    }
}
