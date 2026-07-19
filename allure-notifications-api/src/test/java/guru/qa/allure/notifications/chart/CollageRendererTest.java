package guru.qa.allure.notifications.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.config.chart.ChartPanelItem;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;

class CollageRendererTest {

    @Test
    void rendersCollagePngWithConfiguredDimensions() throws Exception {
        Base base = collageBase();
        Summary summary = summary();
        Legend legend = legend();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        byte[] png = CollageRenderer.render(base, analytics, legend);

        assertNotNull(png);
        assertTrue(png.length > 0);

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertEquals(1000, image.getWidth());
        assertEquals(600, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void rendersDashboardGridWithHistoryPanels() throws Exception {
        Base base = collageBase();
        base.getChart().setPanels(java.util.Arrays.asList(
                java.util.Arrays.asList("pie", "testingPyramid"),
                java.util.Arrays.asList("statusDynamics", "successRateDistribution")));
        base.getChart().setHistoryPath(historyFixture().toString());

        Summary summary = summary();
        Legend legend = legend();
        ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

        byte[] png = CollageRenderer.render(base, analytics, legend);

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertEquals(1000, image.getWidth());
        assertEquals(600, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    private static Path historyFixture() throws java.io.IOException {
        String jsonl = String.join("\n",
                "{\"uuid\":\"r1\",\"timestamp\":1000,\"testResults\":{"
                        + "\"a\":{\"id\":\"a\",\"status\":\"passed\"},"
                        + "\"b\":{\"id\":\"b\",\"status\":\"failed\"}}}",
                "{\"uuid\":\"r2\",\"timestamp\":2000,\"testResults\":{"
                        + "\"a\":{\"id\":\"a\",\"status\":\"passed\"},"
                        + "\"b\":{\"id\":\"b\",\"status\":\"broken\"}}}");
        Path file = java.nio.file.Files.createTempFile("collage-history", ".jsonl");
        java.nio.file.Files.write(file, jsonl.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        file.toFile().deleteOnExit();
        return file;
    }

    @Test
    void chartFacadeUsesCollageMode() throws Exception {
        Base base = collageBase();
        byte[] chart = Chart.createChart(base, summary(), legend());

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(chart));
        assertEquals(1000, image.getWidth());
        assertEquals(600, image.getHeight());
    }

    @Test
    void rendersFreeLayoutCb870DefaultLossless() throws Exception {
        Base base = collageBase();
        ChartConfig chart = base.getChart();
        chart.setLayout("free");
        chart.setWidth(870);
        chart.setHeight(1080);
        chart.setGridCols(10);
        chart.setGridRows(10);
        chart.setHeaderHeight(68);

        ChartPanelItem pie = new ChartPanelItem();
        pie.setType("pie");
        pie.setX(0);
        pie.setY(0);
        pie.setW(5);
        pie.setH(5);
        ChartPanelItem pyramid = new ChartPanelItem();
        pyramid.setType("testingPyramid");
        pyramid.setX(5);
        pyramid.setY(0);
        pyramid.setW(5);
        pyramid.setH(5);
        ChartPanelItem durations = new ChartPanelItem();
        durations.setType("durations");
        durations.setX(0);
        durations.setY(5);
        durations.setW(10);
        durations.setH(5);
        chart.setItems(java.util.Arrays.asList(pie, pyramid, durations));

        byte[] png = CollageRenderer.render(base, ReportAnalyticsBuilder.build(base, summary()), legend());

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertEquals(870, image.getWidth());
        assertEquals(1080, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    private static Base collageBase() throws URISyntaxException {
        Base base = new Base();
        base.setProject("Collage Project");
        base.setAllureFolder(fixture("fixtures/allure3-report").toString());
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());

        ChartConfig chartConfig = new ChartConfig();
        chartConfig.setMode("collage");
        chartConfig.setPanels(java.util.Arrays.asList(
                java.util.Arrays.asList("pie", "testingPyramid"),
                java.util.Arrays.asList("durations")));
        chartConfig.setPyramidFallback("suites");
        chartConfig.setWidth(1000);
        chartConfig.setHeight(600);
        base.setChart(chartConfig);
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
        for (int y = 0; y < image.getHeight(); y += 20) {
            for (int x = 0; x < image.getWidth(); x += 20) {
                if (image.getRGB(x, y) != background) {
                    return true;
                }
            }
        }
        return false;
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(CollageRendererTest.class.getClassLoader().getResource(resource).toURI());
    }
}
