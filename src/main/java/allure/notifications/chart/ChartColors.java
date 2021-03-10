package allure.notifications.chart;

import java.awt.*;
import java.util.List;

/**
 * Отвечает за создание цветов диаграммы.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class ChartColors {
    public static Color[] getSliceColors(List<int[]> colors) {
        return new Color[]{
                new Color(colors.get(0)[0], colors.get(0)[1], colors.get(0)[2]),
                new Color(colors.get(1)[0], colors.get(1)[1], colors.get(1)[2]),
                new Color(colors.get(2)[0], colors.get(2)[1], colors.get(2)[2]),
                new Color(colors.get(3)[0], colors.get(3)[1], colors.get(3)[2]),
                new Color(colors.get(4)[0], colors.get(4)[1], colors.get(4)[2])
        };
    }
}
