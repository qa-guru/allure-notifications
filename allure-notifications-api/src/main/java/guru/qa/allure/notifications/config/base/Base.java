package guru.qa.allure.notifications.config.base;

import java.util.Map;

import guru.qa.allure.notifications.config.enums.Language;
import lombok.Data;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing base settings.
 */
@Data
public class Base {
    private String project;
    private String environment;
    private String comment;
    private String reportLink;
    private Language language;
    private String logo;
    private String allureFolder;
    private Boolean enableChart;
    private Boolean enableSuitesPublishing;
    private String durationFormat = "HH:mm:ss.SSS";
    private Map<String, String> customData;
}
