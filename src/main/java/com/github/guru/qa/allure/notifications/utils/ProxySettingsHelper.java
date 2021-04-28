package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.ProxySettings;
import org.aeonbits.owner.ConfigFactory;

public class ProxySettingsHelper {
    public static String proxyHost() {
        return readSettings().proxyHost();
    }

    public static int proxyPort() {
        return readSettings().proxyPort();
    }

    public static String proxyUsername() {
        return readSettings().proxyUsername();
    }

    public static String proxyPassword() {
        return readSettings().proxyPassword();
    }

    private static ProxySettings readSettings() {
        return ConfigFactory.newInstance().create(ProxySettings.class, System.getProperties());
    }
}
