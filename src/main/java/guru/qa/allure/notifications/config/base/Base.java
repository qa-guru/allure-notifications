package guru.qa.allure.notifications.config.base;

import com.google.gson.annotations.SerializedName;
import guru.qa.allure.notifications.config.enums.Language;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing base settings.
 */
@Data
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
    @SerializedName("logo")
    private String logo;
    @SerializedName("allureFolder")
    private String allureFolder;
    @SerializedName("enableChart")
    private Boolean enableChart;
    @SerializedName("durationFormat")
    private String durationFormat = "HH:mm:ss.SSS";
}
