package guru.qa.allure.notifications.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class AllureResultsReaderTest {

    @Test
    void readsResultFilesWithLayerSuiteAndDuration() throws Exception {
        Path folder = fixture("fixtures/allure-results");
        List<AllureTestResult> results = AllureResultsReader.read(folder);

        assertEquals(3, results.size());
        Map<String, AllureTestResult> byName = results.stream()
                .collect(Collectors.toMap(AllureTestResult::getName, Function.identity()));

        AllureTestResult unit = byName.get("unitTest");
        assertEquals("unit", unit.getLayer());
        assertEquals("UnitSuite", unit.getSuiteName());
        assertEquals(500L, unit.getDurationMs());

        AllureTestResult integration = byName.get("integrationTest");
        assertEquals("integration", integration.getLayer());
        assertEquals("IntegrationParent", integration.getSuiteName());
        assertEquals(1500L, integration.getDurationMs());

        AllureTestResult e2e = byName.get("e2eTest");
        assertEquals("e2e", e2e.getLayer());
        assertEquals("E2ESuite", e2e.getSuiteName());
        assertEquals(3000L, e2e.getDurationMs());
    }

    @Test
    void returnsEmptyListForEmptyFolder() throws Exception {
        Path folder = fixture("fixtures/empty-results");
        assertTrue(AllureResultsReader.read(folder).isEmpty());
    }

    @Test
    void skipsInvalidJson(@TempDir Path tempDir) throws Exception {
        Path broken = fixture("fixtures/broken-results/bad-uuid-result.json");
        Path target = tempDir.resolve("bad-uuid-result.json");
        Files.copy(broken, target);
        Files.write(tempDir.resolve("ok-uuid-result.json"),
                ("{\"uuid\":\"ok\",\"name\":\"ok\",\"status\":\"passed\","
                        + "\"start\":1,\"stop\":2,\"labels\":[]}").getBytes());

        List<AllureTestResult> results = AllureResultsReader.read(tempDir);
        assertEquals(1, results.size());
        assertEquals("ok", results.get(0).getName());
    }

    @Test
    void resolvesSiblingResultsFolder() throws Exception {
        Path report = fixture("fixtures/dashboard-sibling/allure-report");
        Path siblingResults = report.getParent().resolve("allure-results");
        Files.createDirectories(siblingResults);
        try {
            Path resolved = AllureResultsReader.resolveResultsFolder(null, report);
            assertEquals(siblingResults.toAbsolutePath().normalize(), resolved);
        } finally {
            Files.deleteIfExists(siblingResults);
        }
    }

    @Test
    void usesExplicitResultsFolder() throws Exception {
        Path explicit = fixture("fixtures/allure-results");
        Path resolved = AllureResultsReader.resolveResultsFolder(explicit.toString(), Paths.get("/tmp/unused"));
        assertEquals(explicit.toAbsolutePath().normalize(), resolved);
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(AllureResultsReaderTest.class.getClassLoader().getResource(resource).toURI());
    }
}
