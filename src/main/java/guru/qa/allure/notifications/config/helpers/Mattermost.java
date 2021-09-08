package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.exceptions.ArgumentNotProvidedException;

import java.util.Optional;

public class Mattermost {

    public static String url() {
        return ApplicationConfig.config.getString("app.mattermost.url");
    }

}
