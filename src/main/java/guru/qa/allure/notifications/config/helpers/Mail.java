package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;

public class Mail {
    public static String host() {
        return ApplicationConfig.config.getString("app.mail.host");
    }

    public static String port() {
        return ApplicationConfig.config.getString("app.mail.port");
    }

    public static String username() {
        return ApplicationConfig.config.getString("app.mail.username");
    }

    public static String password() {
        return ApplicationConfig.config.getString("app.mail.password");
    }

    public static Boolean enableSSL() {
        return ApplicationConfig.config.getBoolean("app.mail.enableSSL");
    }

    public static String recipient() {
        return ApplicationConfig.config.getString("app.mail.recipient");
    }

    public static String from() {
        return ApplicationConfig.config.getString("app.mail.from");
    }
}
