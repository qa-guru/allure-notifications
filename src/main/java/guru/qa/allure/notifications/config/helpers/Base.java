package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;

public class Base {
    public static String lang() {
        return ApplicationConfig.config.getString("app.base.lang");
    }

    public static String messenger() {
        return ApplicationConfig.config.getString("app.base.messenger");
    }

    public static String allureFolder() {
        return ApplicationConfig.config.getString("app.base.allureFolder");
    }

    public static String mattermostUrl() {
        return ApplicationConfig.config.getString("app.base.mattermostUrl");
    }
}
