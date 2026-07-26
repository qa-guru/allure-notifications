package guru.qa.allure.notifications.model.phrases;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * Localized labels for notification links.
 */
@Getter
public class LinkPhrases {
    @SerializedName("report")
    private String report;

    @SerializedName("dashboard")
    private String dashboard;

    @SerializedName("testops")
    private String testops;

    @SerializedName("build")
    private String build;
}
