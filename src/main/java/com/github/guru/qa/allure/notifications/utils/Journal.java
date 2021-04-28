package com.github.guru.qa.allure.notifications.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.github.guru.qa.allure.notifications.utils.BuildInfoHelper.*;
import static com.github.guru.qa.allure.notifications.utils.MailSettingsHelper.*;
import static com.github.guru.qa.allure.notifications.utils.ProxySettingsHelper.*;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;

public class Journal {
    private static final Logger LOG = LoggerFactory.getLogger(Journal.class);

    public static void buildInfo() {
        LOG.info("\n=======BUILD INFO=======" +
                        "\nbuild.launch.name: {}" +
                        "\nbuild.env: {}" +
                        "\nbuild.report.link: {}",
                buildLaunchName(),
                buildEnvironment(),
                buildReportLink());
    }

    public static void settings() {
        LOG.info("\n=======SETTINGS=======" +
                        "\nenable.chart: {}" +
                        "\nbot.token: {}" +
                        "\nchat.id: {}" +
                        "\nproject.name: {}" +
                        "\nallure.report.folder: {}" +
                        "\nmessenger: {}" +
                        "\nmattermost.api.url: {}",
                enableChart(),
                botToken(),
                chatId(),
                projectName(),
                allureReportFolder(),
                messenger(),
                mattermostApiUrl());
    }

    public static void mailSetting() {
        LOG.info("\n=======MAIL SETTINGS=======" +
                        "\nmail.host: {}" +
                        "\nmail.ssl.enable: {}" +
                        "\nmail.port: {}" +
                        "\nmail.to: {}",
                mailHost(),
                mailSslEnable(),
                mailPort(),
                mailTo());
    }

    public static void proxySetting() {
        LOG.info("\n=======PROXY SETTINGS=======" +
                        "\nproxy.host: {}" +
                        "\nproxy.port: {}" +
                        "\nproxy.username: {}",
                proxyHost(),
                proxyPort(),
                proxyUsername());
    }
}
