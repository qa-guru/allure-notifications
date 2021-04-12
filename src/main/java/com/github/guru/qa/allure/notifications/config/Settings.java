package com.github.guru.qa.allure.notifications.config;

import com.github.guru.qa.allure.notifications.config.enums.Messenger;
import org.aeonbits.owner.Config;

@Config.Sources({"system:properties"})
public interface Settings extends Config {
    @Key("enable.chart")
    @DefaultValue("false")
    Boolean enableChart();
    @Key("bot.token")
    String botToken();
    @Key("chat.id")
    String chatId();
    @Key("project.name")
    String projectName();
    @Key("allure.report.folder")
    String allureReportFolder();
    @Key("messenger")
    @DefaultValue("telegram")
    Messenger messenger();
    @Key("mattermost.api.url")
    String mattermostApiUrl();
    @Key("mail.host")
    String mailHost();
    @Key("mail.ssl.enable")
    @DefaultValue("true")
    String mailSslEnable();
    @Key("mail.port")
    String mailPort();
    @Key("mail.username")
    String mailUsername();
    @Key("mail.password")
    String mailPassword();
    @Key("mail.to")
    String mailTo();
}
