package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.formatters.Formatters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for percentage calculation.
 */
public class Percentage {
    private static final Logger LOG =
            LoggerFactory.getLogger(Percentage.class);

    public double eval(int result, int total) {
        LOG.info("Calculate percentage for result {} by total {}", result,
                total);
        double value = (result * 100.00) / total;
        return new Formatters().formatDouble(value);
    }
}
