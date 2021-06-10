package guru.qa.allure.notifications.config;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import guru.qa.allure.notifications.config.helpers.Build;

import java.io.File;

/**
 * <p>Считывает настройки с JSON-файла для дальнейшей работы</p>
 */
public class ApplicationConfig {
    public static final Config config = ConfigFactory.load();
//            .parseFile(new File(Build.file()));
}
