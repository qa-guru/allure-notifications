package guru.qa.allure.notifications.report;

import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * Thrown when summary.json cannot be located under the configured Allure folder.
 */
public class ReportNotFoundException extends MessageBuildException {
    public ReportNotFoundException(String message) {
        super(message, null);
    }

    public ReportNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
