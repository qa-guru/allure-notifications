package guru.qa.allure.notifications.model.phrases;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing template scenario phrases.
 */
@Getter
public class Scenario {
    @SerializedName("duration")
    private String duration;
    @SerializedName("totalScenarios")
    private String totalScenarios;
    @SerializedName("totalPassed")
    private String totalPassed;
    @SerializedName("totalFailed")
    private String totalFailed;
    @SerializedName("totalBroken")
    private String totalBroken;
    @SerializedName("totalUnknown")
    private String totalUnknown;
    @SerializedName("totalSkipped")
    private String totalSkipped;
    @SerializedName("ofPassedTests")
    private String ofPassedTests;
    @SerializedName("ofFailedTests")
    private String ofFailedTests;
}
