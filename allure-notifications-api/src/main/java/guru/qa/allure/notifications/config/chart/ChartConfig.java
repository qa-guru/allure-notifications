package guru.qa.allure.notifications.config.chart;

import java.util.Arrays;
import java.util.List;

import lombok.Data;

/**
 * Collage / legacy chart settings (5.0+).
 */
@Data
public class ChartConfig {
    private String mode = "pie";
    private List<String> panels = Arrays.asList("pie", "testingPyramid", "durations");
    private String pyramidFallback = "suites";
    private Integer width = 1000;
    private Integer height = 600;
}
