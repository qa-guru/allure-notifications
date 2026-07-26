package guru.qa.allure.notifications.config.links;

import lombok.Data;

/**
 * Notification links block (5.0+).
 */
@Data
public class Links {
    private String report;
    private String dashboard;
    private String testops;
    private String build;
}
