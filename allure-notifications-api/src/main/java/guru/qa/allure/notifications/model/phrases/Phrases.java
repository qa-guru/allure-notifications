package guru.qa.allure.notifications.model.phrases;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing template phrases.
 */
@Getter
public class Phrases {
    @SerializedName("results")
    private String results;
    @SerializedName("environment")
    private String environment;
    @SerializedName("comment")
    private String comment;
    @SerializedName("reportAvailableAtLink")
    private String reportAvailableAtLink;
    @SerializedName("scenario")
    private Scenario scenario;
    @SerializedName("numberOfSuites")
    private String numberOfSuites;
    @SerializedName("suiteName")
    private String suiteName;
}
