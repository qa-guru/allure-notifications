package guru.qa.allure.notifications.formatters;

import static org.junit.jupiter.api.Assertions.assertEquals;

import guru.qa.allure.notifications.config.base.Base;
import org.junit.jupiter.api.Test;

class FormattersTests {
    @Test
    void shouldFormatDurationUsingDefaultConfig() {
        String durationAsString = Formatters.formatDuration(45296789L, new Base().getDurationFormat());
        assertEquals("12:34:56.789", durationAsString);
    }

    @Test
    void shouldFormatDurationUsingCustomFormat() {
        String durationAsString = Formatters.formatDuration(45296789L, "HH:mm:ss");
        assertEquals("12:34:56", durationAsString);
    }
}
