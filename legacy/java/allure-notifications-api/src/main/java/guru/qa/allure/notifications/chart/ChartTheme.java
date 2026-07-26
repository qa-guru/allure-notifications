package guru.qa.allure.notifications.chart;

import java.awt.Color;

import guru.qa.allure.notifications.config.base.Base;
import lombok.Getter;

/**
 * Dark / light palette for chart panels.
 */
@Getter
public final class ChartTheme {
    public static final Color STATUS_PASSED = new Color(148, 202, 102);
    public static final Color STATUS_FAILED = new Color(255, 87, 68);
    public static final Color STATUS_BROKEN = new Color(255, 206, 87);
    public static final Color STATUS_SKIPPED = new Color(170, 170, 170);
    public static final Color STATUS_UNKNOWN = new Color(216, 97, 190);

    private static final Color DARK_BACKGROUND = new Color(50, 50, 50);
    private static final Color DARK_TEXT = new Color(220, 220, 220);
    private static final Color DARK_BAR = new Color(59, 130, 246);
    private static final Color LIGHT_BACKGROUND = Color.WHITE;
    private static final Color LIGHT_TEXT = Color.BLACK;
    private static final Color LIGHT_BAR = new Color(37, 99, 235);

    private final Color background;
    private final Color text;
    private final Color accent;
    private final boolean dark;

    private ChartTheme(Color background, Color text, Color accent, boolean dark) {
        this.background = background;
        this.text = text;
        this.accent = accent;
        this.dark = dark;
    }

    public static ChartTheme from(Base base) {
        boolean dark = base != null && Boolean.TRUE.equals(base.getDarkMode());
        if (dark) {
            return new ChartTheme(DARK_BACKGROUND, DARK_TEXT, DARK_BAR, true);
        }
        return new ChartTheme(LIGHT_BACKGROUND, LIGHT_TEXT, LIGHT_BAR, false);
    }
}
