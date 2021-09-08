package guru.qa.allure.notifications.config;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

/**
 * <strong>Поддерживаемые ключи</strong>
 * <p><code>job</code> - Jenkins Job</p>
 * <p><code>env</code> - Среда, на которой проводится тестирование</p>
 * <p><code>comm</code> - Комментарий/p>
 * <p><code>reportLink</code> - Ссылка на итоговый отчет</p>
 */
public class BuildConfig {
    public static final Config config = ConfigFactory.systemProperties();
}
