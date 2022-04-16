package guru.qa.allure.notifications.model.phrases;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing template scenario phrases.
 */
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

    public String duration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String totalScenarios() {
        return totalScenarios;
    }

    public void setTotalScenarios(String totalScenarios) {
        this.totalScenarios = totalScenarios;
    }

    public String totalPassed() {
        return totalPassed;
    }

    public void setTotalPassed(String totalPassed) {
        this.totalPassed = totalPassed;
    }

    public String totalFailed() {
        return totalFailed;
    }

    public void setTotalFailed(String totalFailed) {
        this.totalFailed = totalFailed;
    }

    public String totalBroken() {
        return totalBroken;
    }

    public void setTotalBroken(String totalBroken) {
        this.totalBroken = totalBroken;
    }

    public String totalUnknown() {
        return totalUnknown;
    }

    public void setTotalUnknown(String totalUnknown) {
        this.totalUnknown = totalUnknown;
    }

    public String totalSkipped() {
        return totalSkipped;
    }

    public void setTotalSkipped(String totalSkipped) {
        this.totalSkipped = totalSkipped;
    }

    public String percentOfPassedTests() {
        return ofPassedTests;
    }

    public void setOfPassedTests(String ofPassedTests) {
        this.ofPassedTests = ofPassedTests;
    }

    public String percentOfFailedTests() {
        return ofFailedTests;
    }

    public void setOfFailedTests(String ofFailedTests) {
        this.ofFailedTests = ofFailedTests;
    }
}
