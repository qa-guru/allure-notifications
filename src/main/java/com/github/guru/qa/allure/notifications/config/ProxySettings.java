package com.github.guru.qa.allure.notifications.config;

import org.aeonbits.owner.Config;

@Config.Sources({"system:properties"})
public interface ProxySettings extends Config {
    @Key("proxy.host")
    String proxyHost();
    @Key("proxy.port")
    @DefaultValue("0")
    int proxyPort();
    @Key("proxy.username")
    String proxyUsername();
    @Key("proxy.password")
    String proxyPassword();
}
