package guru.qa.allure.notifications.config.slack;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing slack settings.
 */
@Data
public class Slack {
    private String token;
    private String chat;
    private String replyTo;
    private String templatePath = "/templates/markdown.ftl";
}
