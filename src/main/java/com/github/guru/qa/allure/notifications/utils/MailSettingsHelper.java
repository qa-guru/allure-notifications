package com.github.guru.qa.allure.notifications.utils;

import com.github.guru.qa.allure.notifications.config.MailSettings;
import org.aeonbits.owner.ConfigFactory;

public class MailSettingsHelper {
    public static String mailHost() {
        return readSettings().mailHost();
    }

    public static String mailSslEnable() {
        return readSettings().mailSslEnable();
    }

    public static String mailPort() {
        return readSettings().mailPort();
    }

    public static String mailUsername() {
        return readSettings().mailUsername();
    }

    public static String mailPassword() {
        return readSettings().mailPassword();
    }

    public static String mailTo() { return readSettings().mailTo(); }

    private static MailSettings readSettings() {
        return ConfigFactory.newInstance().create(MailSettings.class, System.getProperties());
    }
}
