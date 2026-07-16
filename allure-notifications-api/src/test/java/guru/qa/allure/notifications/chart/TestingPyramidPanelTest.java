package guru.qa.allure.notifications.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.image.BufferedImage;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.AllureTestResult;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;

class TestingPyramidPanelTest {

    @Test
    void rendersPyramidWithLayerLabels() throws Exception {
        Base base = baseWithFixtures();
        Summary summary = summary();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        BufferedImage image = new TestingPyramidPanel().render(
                PanelContext.of(base, 400, 280, analytics, legend()));

        assertEquals("testingPyramid", new TestingPyramidPanel().getId());
        assertEquals(400, image.getWidth());
        assertEquals(280, image.getHeight());
        assertTrue(analytics.hasLayerLabels());
        assertTrue(analytics.hasKnownLayerLabels());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void fallsBackToSuitesWhenNoLayerLabels() throws Exception {
        Base base = baseWithProject();
        ChartConfig chartConfig = new ChartConfig();
        chartConfig.setPyramidFallback("suites");
        base.setChart(chartConfig);

        Summary summary = summary();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary, Collections.<AllureTestResult>emptyList());
        assertTrue(!analytics.hasLayerLabels());

        BufferedImage image = new TestingPyramidPanel().render(
                PanelContext.of(base, 400, 220, analytics, legend()));

        assertEquals(400, image.getWidth());
        assertEquals(220, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void fallsBackToSuitesWhenOnlyUnknownLayerLabels() throws Exception {
        Base base = baseWithProject();
        ChartConfig chartConfig = new ChartConfig();
        chartConfig.setPyramidFallback("suites");
        base.setChart(chartConfig);

        AllureTestResult uiTests = parseResult(
                "{\"name\":\"legacy\",\"status\":\"passed\",\"labels\":["
                        + "{\"name\":\"layer\",\"value\":\"UI Tests\"},"
                        + "{\"name\":\"suite\",\"value\":\"LegacySuite\"}]}");
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary(), Collections.singletonList(uiTests));
        assertTrue(analytics.hasLayerLabels());
        assertTrue(!analytics.hasKnownLayerLabels());

        BufferedImage image = new TestingPyramidPanel().render(
                PanelContext.of(base, 400, 220, analytics, legend()));

        assertEquals(400, image.getWidth());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void rendersOtherBandWhenKnownAndUnknownLayersPresent() throws Exception {
        Base base = baseWithProject();
        AllureTestResult unit = parseResult(
                "{\"name\":\"u\",\"status\":\"passed\",\"labels\":["
                        + "{\"name\":\"layer\",\"value\":\"unit\"},"
                        + "{\"name\":\"suite\",\"value\":\"UnitSuite\"}]}");
        AllureTestResult visual = parseResult(
                "{\"name\":\"v\",\"status\":\"passed\",\"labels\":["
                        + "{\"name\":\"layer\",\"value\":\"visual\"},"
                        + "{\"name\":\"suite\",\"value\":\"VisualSuite\"}]}");

        ReportAnalytics analytics = ReportAnalyticsBuilder.build(summary(), Arrays.asList(unit, visual));
        assertTrue(analytics.hasKnownLayerLabels());

        BufferedImage image = new TestingPyramidPanel().render(
                PanelContext.of(base, 400, 280, analytics, legend()));

        assertTrue(hasNonBackgroundPixels(image));
        assertEquals(1, analytics.getLayers().get("unit").intValue());
        assertEquals(1, analytics.getLayers().get("visual").intValue());
    }

    private static Base baseWithProject() {
        Base base = new Base();
        base.setProject("Test Project");
        base.setAllureFolder("allure-report");
        return base;
    }

    private static Base baseWithFixtures() throws URISyntaxException {
        Base base = baseWithProject();
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());
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
        return Paths.get(TestingPyramidPanelTest.class.getClassLoader().getResource(resource).toURI());
    }
}
