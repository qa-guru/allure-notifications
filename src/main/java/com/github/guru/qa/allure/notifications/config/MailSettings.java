package com.github.guru.qa.allure.notifications.config;

import org.aeonbits.owner.Config;

@Config.Sources({"system:properties"})
public interface MailSettings extends Config {
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
    @Key("mail.from")
    String mailFrom();
}
