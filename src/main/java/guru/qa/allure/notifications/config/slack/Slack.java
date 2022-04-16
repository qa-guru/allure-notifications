package guru.qa.allure.notifications.config.slack;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing slack settings.
 */
public class Slack {
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
    @SerializedName("replyTo")
    private String replyTo;

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

    public String replyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }
}
