package guru.qa.allure.notifications.config.skype;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing skype settings.
 */
@Data
public class Skype {
    private String appId;
    private String appSecret;
    private String serviceUrl;
    private String conversationId;
    private String botId;
    private String botName;
    private String templatePath = "/templates/markdown.ftl";
}
