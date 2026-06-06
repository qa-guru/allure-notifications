package guru.qa.allure.notifications.config.teams;

import lombok.Data;

@Data
public class Teams {
    private String webhookUrl;
    private String templatePath = "/templates/teams.ftl";
}
