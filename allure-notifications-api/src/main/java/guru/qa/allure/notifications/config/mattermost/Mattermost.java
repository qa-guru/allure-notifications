package guru.qa.allure.notifications.config.mattermost;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mattermost settings.
 */
@Getter
public class Mattermost {
    @SerializedName("url")
    private String url;
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}
