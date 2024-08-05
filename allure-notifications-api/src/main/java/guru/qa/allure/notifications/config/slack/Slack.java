package guru.qa.allure.notifications.config.slack;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing slack settings.
 */
@Getter
public class Slack {
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
    @SerializedName("replyTo")
    private String replyTo;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}
