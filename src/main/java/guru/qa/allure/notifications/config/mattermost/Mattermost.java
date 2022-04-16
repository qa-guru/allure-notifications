package guru.qa.allure.notifications.config.mattermost;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing mattermost settings.
 */
public class Mattermost {
    @SerializedName("url")
    private String url;
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;

    public String url() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String token() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String chat() {
        return chat;
    }

    public void setChat(String chat) {
        this.chat = chat;
    }
}
