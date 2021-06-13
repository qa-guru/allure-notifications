package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;

import java.util.Optional;

public class Proxy {
    public static String host() {
        return Optional
                .ofNullable(ApplicationConfig.config
                        .getString("app.proxy.host"))
                .orElse("");
    }

    public static Integer port() {
        return ApplicationConfig.config.getInt("app.proxy.port");
    }

    public static String username() {
        return Optional
                .ofNullable(ApplicationConfig.config
                        .getString("app.proxy.username"))
                .orElse("");
    }

    public static String password() {
        return Optional
                .ofNullable(ApplicationConfig.config
                        .getString("app.proxy.password"))
                .orElse("");
    }
}
