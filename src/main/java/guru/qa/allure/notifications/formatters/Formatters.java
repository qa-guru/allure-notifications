package guru.qa.allure.notifications.formatters;

import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.*;
import java.util.Date;
import java.util.TimeZone;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for data formatting.
 */
public class Formatters {
    private static final Logger LOG =
            LoggerFactory.getLogger(Formatters.class);

    public String formatTime(Long duration) {
        if (duration == null) {
            throw new InvalidArgumentException("Duration can't be null!");
        }
        LOG.info("Duration(ms): {}", duration);
        Date date = new Date(duration);
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        String time = formatter.format(date);
        LOG.info("Formatted time: {}", time);
        return time;
    }

    public double formatDouble(double value) {
        LOG.info("Formatting value {}", value);
        DecimalFormat df = new DecimalFormat("##.#");
        String tmp = df.format(value);
        NumberFormat numberFormat = NumberFormat.getInstance();
        try {
            double result = numberFormat.parse(tmp).doubleValue();
            LOG.info("Formatted value is {}", result);
            return result;
        } catch (ParseException e) {
            return 0.0;
        }
    }

    public String formatReportLink(String link) {
        return link.endsWith("/") ? link + "allure" : link;
    }
}
