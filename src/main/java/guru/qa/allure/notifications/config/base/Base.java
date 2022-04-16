package guru.qa.allure.notifications.config.base;

import com.google.gson.annotations.SerializedName;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.config.enums.Messenger;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing base settings.
 */
public class Base {
    @SerializedName("project")
    private String project;
    @SerializedName("environment")
    private String environment;
    @SerializedName("comment")
    private String comment;
    @SerializedName("reportLink")
    private String reportLink;
    @SerializedName("language")
    private Language language;
    @SerializedName("messenger")
    private Messenger messenger;
    @SerializedName("allureFolder")
    private String allureFolder;
    @SerializedName("enableChart")
    private Boolean enableChart;

    public String project() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
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

    public String reportLink() {
        return reportLink;
    }

    public void setReportLink(String reportLink) {
        this.reportLink = reportLink;
    }

    public Language language() {
        return language;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }

    public Messenger messenger() {
        return messenger;
    }

    public void setMessenger(Messenger messenger) {
        this.messenger = messenger;
    }

    public String allureFolder() {
        return allureFolder;
    }

    public void setAllureFolder(String allureFolder) {
        this.allureFolder = allureFolder;
    }

    public Boolean enableChart() {
        return enableChart;
    }

    public void setEnableChart(Boolean enableChart) {
        this.enableChart = enableChart;
    }
}
