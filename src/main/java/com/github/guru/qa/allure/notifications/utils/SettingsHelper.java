package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.Settings;
import com.github.guru.qa.allure.notifications.config.enums.Messenger;
import org.aeonbits.owner.ConfigFactory;

public class SettingsHelper {
    public static boolean enableChart() {
        return readSettings().enableChart();
    }

    public static String botToken() {
        return readSettings().botToken();
    }

    public static String chatId() {
        return readSettings().chatId();
    }

    public static String projectName() {
        return readSettings().projectName();
    }

    public static String allureReportFolder() {
        return readSettings().allureReportFolder() + "widgets/summary.json";
    }

    public static Messenger messenger() {
        return readSettings().messenger();
    }

    public static String mattermostApiUrl() {
        return readSettings().mattermostApiUrl();
    }

    private static Settings readSettings() {
        return ConfigFactory.newInstance().create(Settings.class);
    }
}
