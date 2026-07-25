package guru.qa.allure.notifications.config.chart;

import lombok.Data;

/**
 * One free-grid panel placement on the collage canvas (CB-870 / SQ-1080 cells).
 *
 * <p>{@code x}/{@code y}/{@code w}/{@code h} are cell coordinates on a
 * {@code gridCols × gridRows} grid (default 10×10).
 *
 * <p>{@code by} / {@code groupBy} are optional catalog variants (e.g.
 * {@code problemsDistribution} + {@code by: environment}, {@code durations} +
 * {@code groupBy: layer}). Unknown JSON fields are ignored by the config mapper.
 */
@Data
public class ChartPanelItem {
    private String type;
    private Integer x;
    private Integer y;
    private Integer w;
    private Integer h;
    /**
     * Dimension key for distribution panels (e.g. {@code environment}).
     */
    private String by;
    /**
     * Grouping key for variant panels (e.g. {@code layer}, {@code feature}).
     */
    private String groupBy;
}
