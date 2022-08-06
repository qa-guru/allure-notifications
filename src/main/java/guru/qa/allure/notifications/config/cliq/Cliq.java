package guru.qa.allure.notifications.config.cliq;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author alirezaafkar
 * @since 4.2.2
 * Model class representing cliq settings.
 */
@Getter
public class Cliq {
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
}
