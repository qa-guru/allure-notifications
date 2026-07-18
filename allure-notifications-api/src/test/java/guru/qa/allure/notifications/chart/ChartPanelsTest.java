package guru.qa.allure.notifications.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.image.BufferedImage;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.HistoryAnalytics;
import guru.qa.allure.notifications.report.HistoryReader;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;

class ChartPanelsTest {

    @Test
    void piePanelMatchesLegacyDimensions() throws Exception {
        Base base = baseWithProject();
        Legend legend = legend();
        Summary summary = summary();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary, java.util.Collections.emptyList());
        PanelContext context = PanelContext.of(base, 500, 250, analytics, legend);

        BufferedImage image = new PiePanel().render(context);

        assertEquals("pie", new PiePanel().getId());
        assertEquals(500, image.getWidth());
        assertEquals(250, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void suitesPanelRendersHorizontalBars() throws Exception {
        Base base = baseWithProject();
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());
        Summary summary = summary();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        BufferedImage image = new SuitesPanel().render(
                PanelContext.of(base, 400, 220, analytics, legend()));

        assertEquals("suites", new SuitesPanel().getId());
        assertEquals(400, image.getWidth());
        assertEquals(220, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void durationsPanelRendersHistogram() throws Exception {
        Base base = baseWithProject();
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());
        Summary summary = summary();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        BufferedImage image = new DurationsPanel().render(
                PanelContext.of(base, 500, 200, analytics, legend()));

        assertEquals("durations", new DurationsPanel().getId());
        assertEquals(500, image.getWidth());
        assertEquals(200, image.getHeight());
        assertNotNull(image);
    }

    @Test
    void statusDynamicsPanelRendersFromHistory() throws Exception {
        Base base = baseWithProject();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary(), java.util.Collections.emptyList());
        analytics.setHistory(HistoryAnalytics.from(HistoryReader.read(historyFixture(), 20)));

        BufferedImage image = new StatusDynamicsPanel().render(
                PanelContext.of(base, 400, 220, analytics, legend()));

        assertEquals("statusdynamics", new StatusDynamicsPanel().getId());
        assertEquals(400, image.getWidth());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void successRateDistributionPanelRendersFromHistory() throws Exception {
        Base base = baseWithProject();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary(), java.util.Collections.emptyList());
        analytics.setHistory(HistoryAnalytics.from(HistoryReader.read(historyFixture(), 20)));

        BufferedImage image = new SuccessRateDistributionPanel().render(
                PanelContext.of(base, 400, 220, analytics, legend()));

        assertEquals("successratedistribution", new SuccessRateDistributionPanel().getId());
        assertEquals(400, image.getWidth());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void historyPanelsShowPlaceholderWithoutHistory() throws Exception {
        Base base = baseWithProject();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary(), java.util.Collections.emptyList());

        BufferedImage dynamics = new StatusDynamicsPanel().render(
                PanelContext.of(base, 300, 180, analytics, legend()));
        BufferedImage distribution = new SuccessRateDistributionPanel().render(
                PanelContext.of(base, 300, 180, analytics, legend()));

        assertNotNull(dynamics);
        assertNotNull(distribution);
    }

    @Test
    void legacyChartFacadeStillReturnsPngBytes() throws Exception {
        Base base = baseWithProject();
        byte[] chart = Chart.createChart(base, summary().getStatistic(), legend());
        assertNotNull(chart);
        assertTrue(chart.length > 0);
    }

    private static Base baseWithProject() {
        Base base = new Base();
        base.setProject("Test Project");
        base.setAllureFolder("allure-report");
        return base;
    }

    private static Legend legend() throws java.io.IOException {
        return new JSON().parseResource("/legend/en.json", Legend.class);
    }

    private static Summary summary() throws java.io.IOException {
        return new JSON().parseResource("/data/testSummary.json", Summary.class);
    }

    private static boolean hasNonBackgroundPixels(BufferedImage image) {
        int background = image.getRGB(0, 0);
        for (int y = 0; y < image.getHeight(); y += 10) {
            for (int x = 0; x < image.getWidth(); x += 10) {
                if (image.getRGB(x, y) != background) {
                    return true;
                }
            }
        }
        return false;
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(ChartPanelsTest.class.getClassLoader().getResource(resource).toURI());
    }

    /** Writes a small Allure 3 history.jsonl (3 runs, 3 cases) to a temp file. */
    private static Path historyFixture() throws java.io.IOException {
        String jsonl = String.join("\n",
                "{\"uuid\":\"r1\",\"timestamp\":1000,\"testResults\":{"
                        + "\"a\":{\"id\":\"a\",\"status\":\"passed\"},"
                        + "\"b\":{\"id\":\"b\",\"status\":\"failed\"},"
                        + "\"c\":{\"id\":\"c\",\"status\":\"passed\"}}}",
                "{\"uuid\":\"r2\",\"timestamp\":2000,\"testResults\":{"
                        + "\"a\":{\"id\":\"a\",\"status\":\"passed\"},"
                        + "\"b\":{\"id\":\"b\",\"status\":\"passed\"},"
                        + "\"c\":{\"id\":\"c\",\"status\":\"broken\"}}}",
                "{\"uuid\":\"r3\",\"timestamp\":3000,\"testResults\":{"
                        + "\"a\":{\"id\":\"a\",\"status\":\"failed\"},"
                        + "\"b\":{\"id\":\"b\",\"status\":\"skipped\"},"
                        + "\"c\":{\"id\":\"c\",\"status\":\"passed\"}}}");
        Path file = Files.createTempFile("history-fixture", ".jsonl");
        Files.write(file, jsonl.getBytes(StandardCharsets.UTF_8));
        file.toFile().deleteOnExit();
        return file;
    }
}
