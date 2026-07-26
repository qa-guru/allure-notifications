package guru.qa.allure.notifications.config.base;

import java.util.Map;

import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.config.links.Links;
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
    /**
     * @deprecated use {@code links.report} since 5.0
     */
    @Deprecated
    private String reportLink;
    private Links links;
    private Language language;
    private String logo;
    private String allureFolder;
    /**
     * Optional path to allure-results (for charts / analytics).
     * When null, sibling {@code allure-results/} next to {@link #allureFolder} is used.
     */
    private String allureResultsFolder;
    private Boolean enableChart;
    private ChartConfig chart;
    private Boolean darkMode;
    private Boolean enableSuitesPublishing;
    private String durationFormat = "HH:mm:ss.SSS";
    private Map<String, String> customData;
}
