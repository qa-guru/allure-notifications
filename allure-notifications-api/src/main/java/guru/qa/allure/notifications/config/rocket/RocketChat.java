package guru.qa.allure.notifications.config.rocket;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class RocketChat {

    @SerializedName("url")
    private String url;
    @SerializedName("auth_token")
    private String token;
    @SerializedName("user_id")
    private String userId;
    @SerializedName("channel")
    private String channel;
}
