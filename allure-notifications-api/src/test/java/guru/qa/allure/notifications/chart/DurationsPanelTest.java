package guru.qa.allure.notifications.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class DurationsPanelTest {

    @Test
    void averageSecondsByLayerMatchesPyramidTopToBottomOrder() {
        Map<String, List<Long>> byLayer = new LinkedHashMap<String, List<Long>>();
        byLayer.put("unit", Arrays.asList(700L));
        byLayer.put("e2e", Arrays.asList(6600L));
        byLayer.put("manual", Arrays.asList(3000L));

        Map<String, Double> averages = DurationsPanel.averageSecondsByLayer(byLayer);

        assertEquals(Arrays.asList("manual", "e2e", "unit"), Arrays.asList(averages.keySet().toArray()));
        assertEquals(3.0d, averages.get("manual"), 0.001d);
        assertEquals(6.6d, averages.get("e2e"), 0.001d);
        assertEquals(0.7d, averages.get("unit"), 0.001d);
    }
}
