package allure.piechart.telegram.languages;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        "system:properties",
        "classpath:languages/en.properties"
//        "classpath:languages/" + getLanguage() + ".properties" todo
})
public interface Language extends Config {
    @Key("results")
    String resultsLabel();

    @Key("launch")
    String launchLabel();

    @Key("duration")
    String durationLabel();

    @Key("total_scenarios")
    String totalScenariosLabel();

    @Key("environment")
    String environmentLabel();

    @Key("total_passed")
    String totalPassedLabel();

    @Key("total_failed")
    String totalFailedLabel();

    @Key("total_broken")
    String totalBrokenLabel();

    @Key("total_unknown")
    String totalUnknownLabel();

    @Key("total_skipped")
    String totalSkippedLabel();

    @Key("of_failed_tests")
    String ofFailedTestsLabel();

    @Key("of_passed_tests")
    String ofPassedTestsLabel();

    @Key("report_available_by_link")
    String reportsLinkLabel();
}
