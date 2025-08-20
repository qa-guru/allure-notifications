package guru.qa.allure.notifications.config.cliq;

import lombok.Data;

/**
 * Model class representing Zoho Cliq settings.
 */
@Data
public class Cliq {
    private String token;
    private String chat;
    private String bot;
    private String dataCenter = "eu";
    private String templatePath = "/templates/markdown.ftl";
}
