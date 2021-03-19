package com.github.guru.qa.allure.notifications.config;

import org.aeonbits.owner.Config;

@Config.Sources({"system:properties"})
public interface BuildInfo extends Config {
    @Key("build.launch.name")
    String buildLaunchName();
    @Key("build.env")
    String buildEnvironment();
    @Key("build.report.link")
    String buildReportLink();
}
