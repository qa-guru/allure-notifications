package guru.qa.allure.notifications.config.skype;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing skype settings.
 */
@Getter
public class Skype {
    @SerializedName("appId")
    private String appId;
    @SerializedName("appSecret")
    private String appSecret;
    @SerializedName("serviceUrl")
    private String serviceUrl;
    @SerializedName("conversationId")
    private String conversationId;
    @SerializedName("botId")
    private String botId;
    @SerializedName("botName")
    private String botName;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}
