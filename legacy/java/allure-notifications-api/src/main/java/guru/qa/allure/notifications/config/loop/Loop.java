package guru.qa.allure.notifications.config.loop;

import lombok.Data;

@Data
public class Loop {
    private String webhookUrl;
    private String templatePath = "/templates/markdown.ftl";
}
