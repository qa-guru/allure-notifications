package guru.qa.allure.notifications.config.helpers;

import guru.qa.allure.notifications.exceptions.ArgumentNotProvidedException;
import guru.qa.allure.notifications.config.BuildConfig;

import java.util.Optional;

public class Build {
    /**
     * <p>Получает значение по ключу <code>job</code></p>
     * @return значение, если имеется
     * @throws ArgumentNotProvidedException если параметр не указан или null
     */
    public static String job() {
        return Optional
                .ofNullable(BuildConfig.config.getString("job"))
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("job"));
    }

    /**
     * <p>Получает значение по ключу <code>env</code></p>
     * @return значение, если имеется
     * @throws ArgumentNotProvidedException если параметр не указан или null
     */
    public static String env() {
        return Optional
                .ofNullable(BuildConfig.config.getString("env"))
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("env"));
    }

    /**
     * <p>Получает значение по ключу <code>reportLink</code></p>
     * @return значение, если имеется
     * @throws ArgumentNotProvidedException если параметр не указан или null
     */
    public static String reportLink() {
        String link = Optional
                .ofNullable(BuildConfig.config.getString("reportLink"))
                .orElseThrow(() ->
                        new ArgumentNotProvidedException("reportLink"));

        return link + "allure";
    }
}
