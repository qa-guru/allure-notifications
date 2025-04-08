package guru.qa.allure.notifications.config.rocket;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class RocketChat {
    private String url;
    @JsonProperty("auth_token")
    private String token;
    @JsonProperty("user_id")
    private String userId;
    private String channel;
    private String templatePath = "/templates/rocket.ftl";
}
