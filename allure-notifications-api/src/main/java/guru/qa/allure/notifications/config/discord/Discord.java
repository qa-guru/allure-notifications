package guru.qa.allure.notifications.config.discord;

import lombok.Data;

@Data
public class Discord {
    private String botToken;
    private String channelId;
    private String templatePath = "/templates/markdown.ftl";
}
