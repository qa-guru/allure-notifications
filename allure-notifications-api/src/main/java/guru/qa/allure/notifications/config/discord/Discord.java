package guru.qa.allure.notifications.config.discord;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class Discord {
    @SerializedName("botToken")
    private String botToken;
    @SerializedName("channelId")
    private String channelId;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}
