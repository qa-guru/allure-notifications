package guru.qa.allure.notifications.config.cliq;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class Cliq {
    @SerializedName("token")
    private String token;
    @SerializedName("chat")
    private String chat;
    @SerializedName("bot")
    private String bot;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}