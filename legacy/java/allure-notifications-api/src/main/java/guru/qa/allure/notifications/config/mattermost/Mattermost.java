package guru.qa.allure.notifications.config.mattermost;

import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mattermost settings.
 */
@Data
public class Mattermost {
    private String url;
    private String token;
    private String chat;
    private String templatePath = "/templates/markdown.ftl";
}
