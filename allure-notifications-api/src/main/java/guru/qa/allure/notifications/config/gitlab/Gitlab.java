package guru.qa.allure.notifications.config.gitlab;

import lombok.Data;

@Data
public class Gitlab {
    private Boolean enabled = true;
    private String url;
    private String apiKey;
    private String apiToken;
    private String projectId;
    private String mergeRequestIid;
    private String templatePath = "/templates/gitlab.ftl";
}
