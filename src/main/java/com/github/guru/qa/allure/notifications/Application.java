package com.github.guru.qa.allure.notifications;

import com.github.guru.qa.allure.notifications.client.NotificationManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.github.guru.qa.allure.notifications.utils.BuildInfoHelper.*;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;

public class Application {
    private static final Logger LOG = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        LOG.info("\n==========PROPERTIES==========\nbuild.launch.name: {}\nbuild.env: {}\nbuild.report.link: {}" +
                        "\nenable.chart: {}\nbot.token: {}\nchat.id: {}\nproject.name: {}\nallure.report.folder: {}" +
                        "\nmessenger: {}\nmattermost.api.url: {}\nmail.host: {}\nmail.ssl.enable: {}\nmail.port: {}" +
                        "\nmailTo.to: {}", buildLaunchName(), buildEnvironment(), buildReportLink(), enableChart(),
                botToken(), chatId(), projectName(), allureReportFolder(), messenger(), mattermostApiUrl(), mailHost(),
                mailSslEnable(), mailPort(), mailTo());

        LOG.info("Start application.");
        NotificationManager.sendMessage();
        LOG.info("Stop application.");
    }
}
