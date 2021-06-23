package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;

public class SkypeSettings {
    public static String appId() {
        return ApplicationConfig.config.getString("app.skype.appId");
    }

    public static String appSecret() {
        return ApplicationConfig.config.getString("app.skype.appSecret");
    }

    public static String serviceUrl() {
        return ApplicationConfig.config.getString("app.skype.serviceUrl");
    }

    public static String conversationId() {
        return ApplicationConfig.config.getString("app.skype.conversationId");
    }

    public static String botId() {
        return ApplicationConfig.config.getString("app.skype.botId");
    }

    public static String botName() {
        return ApplicationConfig.config.getString("app.skype.botName");
    }
}
