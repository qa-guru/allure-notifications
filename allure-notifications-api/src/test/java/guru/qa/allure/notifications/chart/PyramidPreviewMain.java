package guru.qa.allure.notifications.chart;

import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.chart.ChartConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.AllureResultsReader;
import guru.qa.allure.notifications.report.LocatedReport;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.ReportAnalyticsBuilder;
import guru.qa.allure.notifications.report.ReportLocator;
import guru.qa.allure.notifications.report.SummaryReader;

/**
 * Local visual preview (not an assertion suite).
 * <pre>
 * ./gradlew :allure-notifications-api:test --tests PyramidPreviewMain
 * open allure-notifications-api/build/pyramid-preview
 * </pre>
 */
class PyramidPreviewMain {

    @Test
    void generatePreviewPngs() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/pyramid-preview");
        Files.createDirectories(outDir);

        Path fixturesRoot = moduleDir.resolve("src/test/resources/fixtures");
        Path a3Report = fixturesRoot.resolve("allure3-report");
        Path richResults = outDir.resolve("rich-results");
        writeRichResults(richResults);

        renderAll(outDir, a3Report, fixturesRoot.resolve("allure-results"), "fixture3layers");
        renderAll(outDir, a3Report, richResults, "allLayers");

        System.out.println("Wrote preview PNGs to " + outDir.toAbsolutePath());
    }

    private static void renderAll(Path outDir, Path a3Report, Path results, String prefix) throws Exception {
        for (boolean dark : new boolean[] {false, true}) {
            Base base = base(a3Report, results, dark);
            LocatedReport located = ReportLocator.locate(a3Report);
            Summary summary = SummaryReader.read(new JSON(), located);
            Legend legend = new JSON().parseResource("/legend/en.json", Legend.class);
            ReportAnalytics analytics = ReportAnalyticsBuilder.build(base, summary);

            byte[] collage = CollageRenderer.render(base, analytics, legend);
            String mode = dark ? "dark" : "light";
            Path collagePath = outDir.resolve(prefix + "-collage-" + mode + ".png");
            Files.write(collagePath, collage);

            BufferedImage pyramid = new TestingPyramidPanel().render(
                    PanelContext.of(base, 500, 400, analytics, legend));
            Path pyramidPath = outDir.resolve(prefix + "-pyramid-" + mode + ".png");
            ImageIO.write(pyramid, "png", pyramidPath.toFile());

            System.out.println(prefix + " " + mode
                    + " layers=" + analytics.getLayers()
                    + " known=" + analytics.hasKnownLayerLabels()
                    + " -> " + collagePath.getFileName() + ", " + pyramidPath.getFileName());
        }
    }

    private static Base base(Path report, Path results, boolean dark) {
        Base base = new Base();
        base.setProject("Allure 3 preview");
        base.setAllureFolder(report.toAbsolutePath().toString());
        base.setAllureResultsFolder(results.toAbsolutePath().toString());
        base.setDarkMode(dark);
        ChartConfig chart = new ChartConfig();
        chart.setMode("collage");
        chart.setWidth(1000);
        chart.setHeight(600);
        chart.setPyramidFallback("suites");
        base.setChart(chart);
        return base;
    }

    private static void writeRichResults(Path dir) throws Exception {
        if (Files.exists(dir)) {
            Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (Exception ignored) {
                            // best-effort cleanup
                        }
                    });
        }
        Files.createDirectories(dir);
        String[][] rows = {
                {"unit", "passed", "UnitSuite", "5"},
                {"unit", "passed", "UnitSuite", "8"},
                {"unit", "failed", "UnitSuite", "12"},
                {"component", "passed", "ComponentSuite", "20"},
                {"component", "passed", "ComponentSuite", "25"},
                {"integration", "passed", "IntegrationSuite", "40"},
                {"integration", "broken", "IntegrationSuite", "55"},
                {"api", "passed", "ApiSuite", "30"},
                {"e2e", "passed", "E2ESuite", "90"},
                {"e2e", "failed", "E2ESuite", "120"},
                {"manual", "skipped", "ManualSuite", "10"},
                {"visual", "passed", "VisualSuite", "15"},
        };
        int i = 0;
        for (String[] row : rows) {
            i++;
            String layer = row[0];
            String status = row[1];
            String suite = row[2];
            long dur = Long.parseLong(row[3]);
            long start = 1_000_000L + i * 1000L;
            String uuid = UUID.nameUUIDFromBytes(("preview-" + i).getBytes(StandardCharsets.UTF_8)).toString();
            String json = "{\n"
                    + "  \"uuid\": \"" + uuid + "\",\n"
                    + "  \"name\": \"" + layer + "Case" + i + "\",\n"
                    + "  \"fullName\": \"com.example." + suite + "." + layer + "Case" + i + "\",\n"
                    + "  \"status\": \"" + status + "\",\n"
                    + "  \"start\": " + start + ",\n"
                    + "  \"stop\": " + (start + dur) + ",\n"
                    + "  \"labels\": [\n"
                    + "    {\"name\": \"layer\", \"value\": \"" + layer + "\"},\n"
                    + "    {\"name\": \"suite\", \"value\": \"" + suite + "\"}\n"
                    + "  ]\n"
                    + "}\n";
            Files.write(dir.resolve(uuid + "-result.json"), json.getBytes(StandardCharsets.UTF_8));
        }
        System.out.println("Rich results count=" + AllureResultsReader.read(dir).size());
    }
}
