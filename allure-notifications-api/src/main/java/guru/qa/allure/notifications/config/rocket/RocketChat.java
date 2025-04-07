package guru.qa.allure.notifications.config.rocket;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class RocketChat {

    @SerializedName("url")
    private String url;
    @SerializedName("auth_token")
    @JsonProperty("auth_token")
    private String token;
    @SerializedName("user_id")
    @JsonProperty("user_id")
    private String userId;
    @SerializedName("channel")
    private String channel;
    @SerializedName("templatePath")
    private String templatePath = "/templates/rocket.ftl";
}
