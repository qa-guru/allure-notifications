package guru.qa.allure.notifications.config.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import com.fasterxml.jackson.databind.json.JsonMapper;

import org.junit.jupiter.api.Test;

class ChartConfigTest {

    @Test
    void parsesFlatPanelsAsSingleRow() throws Exception {
        ChartConfig config = new JsonMapper()
                .readValue("{\"panels\": [\"pie\", \"testingPyramid\"]}", ChartConfig.class);

        List<List<String>> panels = config.getPanels();
        assertEquals(1, panels.size());
        assertEquals(java.util.Arrays.asList("pie", "testingPyramid"), panels.get(0));
    }

    @Test
    void parsesNestedPanelsAsRows() throws Exception {
        ChartConfig config = new JsonMapper().readValue(
                "{\"panels\": [[\"pie\", \"testingPyramid\"], [\"statusDynamics\", \"successRateDistribution\"]]}",
                ChartConfig.class);

        List<List<String>> panels = config.getPanels();
        assertEquals(2, panels.size());
        assertEquals(java.util.Arrays.asList("pie", "testingPyramid"), panels.get(0));
        assertEquals(java.util.Arrays.asList("statusDynamics", "successRateDistribution"), panels.get(1));
    }

    @Test
    void parsesHistorySettings() throws Exception {
        ChartConfig config = new JsonMapper().readValue(
                "{\"historyPath\": \"history.jsonl\", \"historyLimit\": 15}", ChartConfig.class);

        assertEquals("history.jsonl", config.getHistoryPath());
        assertEquals(Integer.valueOf(15), config.getHistoryLimit());
    }

    @Test
    void defaultPanelsAreDashboardGrid() {
        ChartConfig config = new ChartConfig();
        assertEquals(2, config.getPanels().size());
        assertEquals(java.util.Arrays.asList("pie", "testingPyramid"), config.getPanels().get(0));
        assertEquals(
                java.util.Arrays.asList("statusDynamics", "successRateDistribution"),
                config.getPanels().get(1));
    }
}
