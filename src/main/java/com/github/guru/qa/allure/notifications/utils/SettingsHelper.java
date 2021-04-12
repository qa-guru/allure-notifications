package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.Settings;
import com.github.guru.qa.allure.notifications.config.enums.Messenger;
import com.github.guru.qa.allure.notifications.exceptions.ArgumentNotProvidedException;
import org.aeonbits.owner.ConfigFactory;

import java.util.Optional;

public class SettingsHelper {
    public static boolean enableChart() {
        return readSettings().enableChart();
    }

    public static String botToken() {
        return Optional
                .ofNullable(readSettings().botToken())
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("bot.token"));
    }

    public static String chatId() {
        return Optional
                .ofNullable(readSettings().chatId())
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("chat.id"));
    }

    public static String projectName() {
        return Optional
                .ofNullable(readSettings().projectName())
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("project.name"));
    }

    public static String allureReportFolder() {
        String folder = Optional
                .ofNullable(readSettings().allureReportFolder())
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("allure.report.folder"));
        return folder + "widgets/summary.json";
    }

    public static Messenger messenger() {
        return readSettings().messenger();
    }

    public static String mattermostApiUrl() {
        return readSettings().mattermostApiUrl();
    }

    private static Settings readSettings() {
        return ConfigFactory.newInstance().create(Settings.class, System.getProperties());
    }
}
