package guru.qa.allure.notifications.config.telegram;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing telegram settings.
 */
@Data
public class Telegram {
    private String token;
    private String chat;
    private String topic;
    private String replyTo;
    private String templatePath = "/templates/telegram.ftl";
}
