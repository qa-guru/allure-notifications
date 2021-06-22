package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.exceptions.ArgumentNotProvidedException;

import java.util.Optional;

public class Base {
    public static String lang() {
        return Optional
                .of(ApplicationConfig.config
                        .getString("app.base.lang"))
                .filter(s -> !s.isEmpty())
                .orElseThrow(() -> new ArgumentNotProvidedException("lang"));
    }

    public static String messenger() {
        return Optional
                .of(ApplicationConfig.config
                        .getString("app.base.messenger"))
                .filter(s -> !s.isEmpty())
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("messenger"));
    }

    public static String allureFolder() {
        return ApplicationConfig.config.getString("app.base.allureFolder");
    }

    public static String mattermostUrl() {
        return ApplicationConfig.config.getString("app.base.mattermostUrl");
    }

    public static Boolean isChartEnabled() {
        return ApplicationConfig.config.getBoolean("app.base.chart");
    }

    public static String chartName() {
        return Optional
                .of(ApplicationConfig.config
                        .getString("app.base.chartName"))
                .filter(s -> !s.isEmpty())
                .orElse("piechart");
    }

    public static String projectName() {
        return Optional
                .of(ApplicationConfig.config
                        .getString("app.base.project"))
                .filter(s -> !s.isEmpty())
                .orElse(Build.projectName());
    }
}
