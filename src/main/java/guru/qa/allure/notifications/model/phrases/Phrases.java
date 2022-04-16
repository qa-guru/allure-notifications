package guru.qa.allure.notifications.model.phrases;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing template phrases.
 */
public class Phrases {
    @SerializedName("results")
    private String results;
    @SerializedName("environment")
    private String environment;
    @SerializedName("comment")
    private String comment;
    @SerializedName("reportAvailableByLink")
    private String reportAvailableByLink;
    @SerializedName("scenario")
    private Scenario scenario;

    public String results() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public String environment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String comment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String reportAvailableByLink() {
        return reportAvailableByLink;
    }

    public void setReportAvailableByLink(String reportAvailableByLink) {
        this.reportAvailableByLink = reportAvailableByLink;
    }

    public Scenario scenario() {
        return scenario;
    }

    public void setScenario(Scenario scenario) {
        this.scenario = scenario;
    }
}
