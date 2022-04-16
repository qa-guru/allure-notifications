package guru.qa.allure.notifications.config.skype;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing skype settings.
 */
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

    public String appId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String appSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    public String serviceUrl() {
        return serviceUrl;
    }

    public void setServiceUrl(String serviceUrl) {
        this.serviceUrl = serviceUrl;
    }

    public String conversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String botId() {
        return botId;
    }

    public void setBotId(String botId) {
        this.botId = botId;
    }

    public String botName() {
        return botName;
    }

    public void setBotName(String botName) {
        this.botName = botName;
    }
}
