package guru.qa.allure.notifications.config.chart;

import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import lombok.Data;

/**
 * Collage / legacy chart settings (5.0+).
 *
 * <p>{@code panels} is a list of rows (each inner list is one horizontal row of the
 * collage grid). A flat array of ids is also accepted and treated as a single row
 * (see {@link PanelsDeserializer}). Used by {@code layout} {@code grid}/{@code stacked}/
 * {@code row} (lossy equal columns within a row).
 *
 * <p>When {@code layout} is {@code free}, placements come from {@link #items} on a
 * {@link #gridCols}×{@link #gridRows} cell grid (collage-builder CB-870 lossless path).
 */
@Data
public class ChartConfig {
    private String mode = "pie";

    @JsonDeserialize(using = PanelsDeserializer.class)
    private List<List<String>> panels = Arrays.asList(
            Arrays.asList("pie", "testingPyramid"),
            Arrays.asList("statusDynamics", "successRateDistribution"));

    /**
     * Free-grid placements ({@code layout = "free"}). Ignored for legacy layouts.
     */
    private List<ChartPanelItem> items;

    /** Cell columns for free layout (default 10 — CB-870-grid). */
    private Integer gridCols = 10;

    /** Cell rows for free layout (default 10 — CB-870-grid). */
    private Integer gridRows = 10;

    private String pyramidFallback = "suites";
    private String layout = "grid";
    private Integer width = 1000;
    private Integer height = 600;

    /**
     * Optional path to an Allure 3 {@code history.jsonl} for the history-based panels
     * (statusDynamics / successRateDistribution). Resolved absolute, or relative to the
     * working directory / allure report folder. When null, those panels show no data.
     */
    private String historyPath;

    /**
     * Number of most recent runs to read from {@link #historyPath}.
     */
    private Integer historyLimit = 20;

    /**
     * Height (px) of each collage card's title bar (traffic-light dots + caption).
     * When null the renderer uses the canon of 68px (shared with the design-system
     * {@code .zds-widget-bar}). Dot size + paddings + font scale proportionally, so the
     * caption stays legible at Telegram's downscaled size.
     */
    private Integer headerHeight;
}
