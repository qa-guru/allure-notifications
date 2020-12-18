package allure.piechart.telegram.utils;

import allure.piechart.telegram.config.DebugConfig;
import org.aeonbits.owner.ConfigFactory;

/**
 * Отвечает за инициализацию конфигов.
 *
 * @author kadehar
 * @since 2.0
 */
public class ConfigHelper {
    /** Возвращает конфиг для отладки приложения */
    public static DebugConfig debug() {
        return ConfigFactory.newInstance().create(DebugConfig.class);
    }
}
