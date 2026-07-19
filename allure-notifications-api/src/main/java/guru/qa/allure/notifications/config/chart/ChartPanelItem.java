package guru.qa.allure.notifications.config.chart;

import lombok.Data;

/**
 * One free-grid panel placement on the collage canvas (collage-builder CB-870 cells).
 *
 * <p>{@code x}/{@code y}/{@code w}/{@code h} are cell coordinates on a
 * {@code gridCols × gridRows} grid (default 10×10).
 */
@Data
public class ChartPanelItem {
    private String type;
    private Integer x;
    private Integer y;
    private Integer w;
    private Integer h;
}
