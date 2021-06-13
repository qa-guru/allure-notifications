package guru.qa.allure.notifications.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.*;
import java.util.Date;
import java.util.TimeZone;

public class Utils {
    private static final Logger LOG = LoggerFactory.getLogger("Utils");

    public static String convertDurationToTime(final Long duration) {
        LOG.info("Duration(ms): {}", duration);
        Date date = new Date(duration);
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        String time = formatter.format(date);
        LOG.info("Formatted time: {}", time);
        return time;
    }

    public static double formatDoubleValue(double value) {
        DecimalFormat df = new DecimalFormat("##.#");
        String tmp = df.format(value);
        NumberFormat numberFormat = NumberFormat.getInstance();
        try {
            return numberFormat.parse(tmp).doubleValue();
        } catch (ParseException e) {
            return 0.0;
        }
    }

    public static double percentage(int result, int total) {
        double value = (result * 100.00) / total;
        return formatDoubleValue(value);
    }
}
