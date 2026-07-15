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
    void chartFacadeUsesCollageMode() throws Exception {
        Base base = collageBase();
        byte[] chart = Chart.createChart(base, summary(), legend());

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(chart));
        assertEquals(1000, image.getWidth());
        assertEquals(600, image.getHeight());
    }

    private static Base collageBase() throws URISyntaxException {
        Base base = new Base();
        base.setProject("Collage Project");
        base.setAllureFolder(fixture("fixtures/allure3-report").toString());
        base.setAllureResultsFolder(fixture("fixtures/allure-results").toString());

        ChartConfig chartConfig = new ChartConfig();
        chartConfig.setMode("collage");
        chartConfig.setPanels(java.util.Arrays.asList("pie", "testingPyramid", "durations"));
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
