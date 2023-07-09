package guru.qa.allure.notifications.config.discord;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class Discord {
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
    @SerializedName("replyTo")
    private String replyTo;
}
