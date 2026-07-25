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
        chart.setCardGap(14);

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

    @Test
    void freeLayoutAcceptsCurrentStatusAliasAndCardGap() throws Exception {
        Base base = collageBase();
        ChartConfig chart = base.getChart();
        chart.setLayout("free");
        chart.setWidth(870);
        chart.setHeight(1080);
        chart.setHeaderHeight(68);
        chart.setCardGap(40);

        ChartPanelItem status = new ChartPanelItem();
        status.setType("currentStatus");
        status.setX(0);
        status.setY(0);
        status.setW(5);
        status.setH(5);
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
        chart.setItems(java.util.Arrays.asList(status, pyramid, durations));

        byte[] tight = CollageRenderer.render(copyWithGap(base, 14),
                ReportAnalyticsBuilder.build(base, summary()), legend());
        byte[] wide = CollageRenderer.render(base,
                ReportAnalyticsBuilder.build(base, summary()), legend());

        BufferedImage tightImage = ImageIO.read(new ByteArrayInputStream(tight));
        BufferedImage wideImage = ImageIO.read(new ByteArrayInputStream(wide));
        assertEquals(870, wideImage.getWidth());
        assertEquals(1080, wideImage.getHeight());
        // Outer background strip at (0,0) stays, but card inset differs → pixel at (20,20) changes.
        assertTrue(tightImage.getRGB(20, 20) != wideImage.getRGB(20, 20)
                || tightImage.getRGB(40, 40) != wideImage.getRGB(40, 40));
    }

    @Test
    void rendersSq1080DenseTwelveTilesWithoutDroppingStubs() throws Exception {
        Base base = collageBase();
        ChartConfig chart = base.getChart();
        chart.setLayout("free");
        chart.setWidth(1080);
        chart.setHeight(1080);
        chart.setGridCols(10);
        chart.setGridRows(10);
        chart.setHeaderHeight(68);
        chart.setCardGap(14);
        chart.setTilePad(6);
        chart.setItems(sq1080Items());

        byte[] png = CollageRenderer.render(base, ReportAnalyticsBuilder.build(base, summary()), legend());

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertEquals(1080, image.getWidth());
        assertEquals(1080, image.getHeight());
        assertEquals(12, chart.getItems().size());
        assertTrue(hasNonBackgroundPixels(image));
    }

    @Test
    void freeLayoutKeepsUnknownTypeAsEmptyCard() throws Exception {
        Base base = collageBase();
        ChartConfig chart = base.getChart();
        chart.setLayout("free");
        chart.setWidth(400);
        chart.setHeight(400);
        chart.setGridCols(2);
        chart.setGridRows(2);
        chart.setHeaderHeight(34);
        chart.setCardGap(8);

        ChartPanelItem unknown = new ChartPanelItem();
        unknown.setType("notARealPanel");
        unknown.setX(0);
        unknown.setY(0);
        unknown.setW(2);
        unknown.setH(2);
        chart.setItems(java.util.Collections.singletonList(unknown));

        byte[] png = CollageRenderer.render(base, ReportAnalyticsBuilder.build(base, summary()), legend());
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertEquals(400, image.getWidth());
        assertEquals(400, image.getHeight());
        assertTrue(hasNonBackgroundPixels(image));
    }

    private static java.util.List<ChartPanelItem> sq1080Items() {
        return java.util.Arrays.asList(
                item("testingPyramid", 0, 0, 3, 3, null, null),
                item("pie", 3, 0, 3, 3, null, null),
                item("statusDynamics", 6, 0, 4, 3, null, null),
                item("testResultSeverities", 0, 3, 3, 2, null, null),
                item("statusTransitions", 3, 3, 3, 2, null, null),
                item("problemsDistribution", 6, 3, 4, 2, "environment", null),
                item("statusAgePyramid", 0, 5, 3, 3, null, null),
                item("successRateDistribution", 3, 5, 4, 2, null, null),
                item("coverageDiff", 7, 5, 3, 2, null, null),
                item("stabilityDistribution", 3, 7, 4, 3, null, "label-name:component"),
                item("durationDynamics", 7, 7, 3, 3, null, null),
                item("durations", 0, 8, 3, 2, null, "layer"));
    }

    private static ChartPanelItem item(String type, int x, int y, int w, int h,
                                       String by, String groupBy) {
        ChartPanelItem panel = new ChartPanelItem();
        panel.setType(type);
        panel.setX(x);
        panel.setY(y);
        panel.setW(w);
        panel.setH(h);
        panel.setBy(by);
        panel.setGroupBy(groupBy);
        return panel;
    }

    private static Base copyWithGap(Base source, int cardGap) throws URISyntaxException {
        Base base = collageBase();
        ChartConfig chart = base.getChart();
        ChartConfig from = source.getChart();
        chart.setLayout(from.getLayout());
        chart.setWidth(from.getWidth());
        chart.setHeight(from.getHeight());
        chart.setHeaderHeight(from.getHeaderHeight());
        chart.setCardGap(cardGap);
        chart.setGridCols(from.getGridCols());
        chart.setGridRows(from.getGridRows());
        chart.setItems(from.getItems());
        return base;
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
