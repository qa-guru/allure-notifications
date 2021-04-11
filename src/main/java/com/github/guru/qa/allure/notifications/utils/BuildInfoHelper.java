package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.BuildInfo;
import org.aeonbits.owner.ConfigFactory;

public class BuildInfoHelper {
    public static String buildLaunchName() {
        return readBuildInfo().buildLaunchName();
    }

    public static String buildEnvironment() {
        return readBuildInfo().buildEnvironment();
    }

    public static String buildReportLink() {
        return readBuildInfo().buildReportLink() + "allure";
    }

    private static BuildInfo readBuildInfo() {
        return ConfigFactory.newInstance().create(BuildInfo.class, System.getProperties());
    }
}
