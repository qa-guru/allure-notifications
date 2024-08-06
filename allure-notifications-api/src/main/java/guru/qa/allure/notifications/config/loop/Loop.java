package guru.qa.allure.notifications.config.loop;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

@Getter
public class Loop {
    @SerializedName("webhookUrl")
    private String webhookUrl;
    @SerializedName("templatePath")
    private String templatePath = "/templates/markdown.ftl";
}