package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;

public class Bot {
    public static String token() {
        return ApplicationConfig.config.getString("app.bot.token");
    }

    public static String chat() {
        return ApplicationConfig.config.getString("app.bot.chat");
    }

    public static String replyTo() {
        return ApplicationConfig.config.getString("app.bot.replyTo");
    }
}
