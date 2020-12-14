package allure.piechart.telegram.utils;

import allure.piechart.telegram.config.DebugConfig;
import org.aeonbits.owner.ConfigFactory;

public class ConfigHelper {
    public static DebugConfig debug() {
        return ConfigFactory.newInstance().create(DebugConfig.class);
    }
}
