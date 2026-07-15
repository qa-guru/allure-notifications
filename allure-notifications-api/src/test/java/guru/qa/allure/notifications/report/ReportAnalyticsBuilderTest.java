package guru.qa.allure.notifications.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;

class ReportAnalyticsBuilderTest {

    @Test
    void buildsAnalyticsFromFixtures() throws Exception {
        Base base = new Base();
        base.setAllureFolder(fixture("fixtures/allure3-report").toString());
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());

        Summary summary = new JSON().parseResource("/data/testSummary.json", Summary.class);
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        assertEquals(3, analytics.getResultCount());
        assertTrue(analytics.hasLayerLabels());
        assertEquals(3, analytics.getStatistic().getTotal());

        Map<String, Integer> layers = analytics.getLayers();
        assertEquals(1, layers.get("unit"));
        assertEquals(1, layers.get("integration"));
        assertEquals(1, layers.get("e2e"));

        List<SuiteStat> suites = analytics.getSuites();
        assertEquals(3, suites.size());
        assertEquals(1, suiteCount(suites, "IntegrationParent"));
        assertEquals(1, suiteCount(suites, "UnitSuite"));
        assertEquals(1, suiteCount(suites, "E2ESuite"));

        List<Long> durations = analytics.getDurationsMs();
        assertEquals(Arrays.asList(500L, 1500L, 3000L), durations);
    }

    @Test
    void returnsEmptyBreakdownWhenNoResults() throws Exception {
        Summary summary = new JSON().parseResource("/data/testSummary.json", Summary.class);
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary, Collections.emptyList());

        assertEquals(0, analytics.getResultCount());
        assertFalse(analytics.hasLayerLabels());
        assertTrue(analytics.getLayers().isEmpty());
        assertTrue(analytics.getSuites().isEmpty());
        assertTrue(analytics.getDurationsMs().isEmpty());
        assertEquals(3, analytics.getStatistic().getTotal());
    }

    @Test
    void limitsTopSuites() {
        AllureTestResult first = resultWithSuite("suite-a");
        AllureTestResult second = resultWithSuite("suite-b");
        AllureTestResult third = resultWithSuite("suite-c");

        ReportAnalytics analytics = ReportAnalyticsBuilder.build(
                null,
                Arrays.asList(first, first, second, third, third, third),
                2);

        assertEquals(2, analytics.getSuites().size());
        assertEquals("suite-c", analytics.getSuites().get(0).getName());
        assertEquals(3, analytics.getSuites().get(0).getCount());
        assertEquals("suite-a", analytics.getSuites().get(1).getName());
        assertEquals(2, analytics.getSuites().get(1).getCount());
    }

    @Test
    void normalizesLayerNamesToLowerCase() {
        AllureTestResult parsed = parseResult("{\"name\":\"t\",\"labels\":[{\"name\":\"layer\",\"value\":\"E2E\"}]}");

        ReportAnalytics analytics = ReportAnalyticsBuilder.build(null, Collections.singletonList(parsed));

        assertTrue(analytics.hasLayerLabels());
        assertEquals(1, analytics.getLayers().get("e2e").intValue());
    }

    private static int suiteCount(List<SuiteStat> suites, String name) {
        return suites.stream()
                .filter(s -> name.equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Suite not found: " + name))
                .getCount();
    }

    private static AllureTestResult resultWithSuite(String suite) {
        return parseResult("{\"name\":\"t\",\"labels\":[{\"name\":\"suite\",\"value\":\"" + suite + "\"}]}");
    }

    private static AllureTestResult parseResult(String json) {
        try {
            java.io.File temp = java.io.File.createTempFile("result", ".json");
            java.nio.file.Files.write(temp.toPath(), json.getBytes());
            return new JSON().parseFile(temp, AllureTestResult.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(ReportAnalyticsBuilderTest.class.getClassLoader().getResource(resource).toURI());
    }
}
