package guru.qa.allure.notifications.config;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

/**
 * <p>Считывает настройки с JSON-файла для дальнейшей работы</p>
 */
public class ApplicationConfig {
    public static final Config config = ConfigFactory.load();
}
