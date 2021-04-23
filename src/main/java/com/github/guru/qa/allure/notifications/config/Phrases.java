package com.github.guru.qa.allure.notifications.config;

import org.aeonbits.owner.Config;

@Config.Sources({"classpath:languages/${lang}.properties"})
public interface Phrases extends Config {
    @Key("results")
    String resultsLabel();
    @Key("launch")
    String launchLabel();
    @Key("duration")
    String durationLabel();
    @Key("environment")
    String environmentLabel();
    @Key("total_scenarios")
    String totalScenariosLabel();
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
    String reportLinkLabel();
    @Key("passed")
    String passed();
    @Key("failed")
    String failed();
    @Key("broken")
    String broken();
    @Key("unknown")
    String unknown();
    @Key("skipped")
    String skipped();
}
