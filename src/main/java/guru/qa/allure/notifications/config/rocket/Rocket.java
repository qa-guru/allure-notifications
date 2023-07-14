package guru.qa.allure.notifications.config.rocket;

import com.google.gson.annotations.SerializedName;
import lombok.Data;

/**
 * @author GerasimchukDV
 * @since 4.2.2
 * Model class representing Rocket client settings.
 */
@Data
public class Rocket {
    @SerializedName("url")
    private String url;
    @SerializedName("auth_token")
    private String token;

    @SerializedName("user_id")
    private String userId;
    @SerializedName("channel")
    private String channel;
}
