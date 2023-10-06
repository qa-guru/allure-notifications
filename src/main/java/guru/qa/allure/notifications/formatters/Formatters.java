package guru.qa.allure.notifications.formatters;

import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.time.DurationFormatUtils;

import java.text.*;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for data formatting.
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Formatters {

    /**
     * Formats the time gap as a string, using the specified format, and padding with zeros.
     *
     * <p>This method formats durations using the days and lower fields of the
     * format pattern. Months and larger are not used.</p>
     *
     * @param durationMillis  the duration to format
     * @param format  the way in which to format the duration, not null
     * @return the formatted duration, not null
     * @throws IllegalArgumentException if durationMillis is null or negative
     */
    public static String formatDuration(Long durationMillis, String format) {
        if (durationMillis == null) {
            throw new InvalidArgumentException("Duration can't be null!");
        }
        log.debug("Duration: {} ms", durationMillis);
        String formattedDuration = DurationFormatUtils.formatDuration(durationMillis, format);
        log.debug("Formatted duration: {}", formattedDuration);
        return formattedDuration;
    }

    public static double formatDouble(double value) {
        log.info("Formatting value {}", value);
        DecimalFormat df = new DecimalFormat("##.#");
        String tmp = df.format(value);
        NumberFormat numberFormat = NumberFormat.getInstance();
        try {
            double result = numberFormat.parse(tmp).doubleValue();
            log.info("Formatted value is {}", result);
            return result;
        } catch (ParseException e) {
            return 0.0;
        }
    }

    public static String formatReportLink(String link) {
        return link != null && link.endsWith("/") ? link + "allure" : link;
    }
}
