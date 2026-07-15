package guru.qa.allure.notifications.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

class ReportLocatorTest {

    @Test
    void locatesAllure2WidgetsSummary() throws Exception {
        Path folder = fixture("fixtures/allure2-report");
        LocatedReport located = ReportLocator.locate(folder);

        assertEquals(AllureReportVersion.ALLURE_2, located.getVersion());
        assertTrue(located.getSummaryPath().endsWith(Paths.get("widgets", "summary.json")));
        assertTrue(located.getSuitesPath().isPresent());
        assertFalse(located.getDashboardPath().isPresent());
        assertEquals(folder.toAbsolutePath().normalize(), located.getReportRoot());
    }

    @Test
    void locatesAllure3RootSummary() throws Exception {
        Path folder = fixture("fixtures/allure3-report");
        LocatedReport located = ReportLocator.locate(folder);

        assertEquals(AllureReportVersion.ALLURE_3, located.getVersion());
        assertTrue(located.getSummaryPath().endsWith("summary.json"));
        assertFalse(located.getSuitesPath().isPresent());
        assertFalse(located.getDashboardPath().isPresent());
    }

    @Test
    void findsNestedSummaryRecursively() throws Exception {
        Path folder = fixture("fixtures/allure3-nested-report");
        LocatedReport located = ReportLocator.locate(folder);

        assertEquals(AllureReportVersion.ALLURE_3, located.getVersion());
        assertTrue(located.getSummaryPath().toString().replace('\\', '/')
                .endsWith("out/build/allure-report/summary.json"));
        assertTrue(located.getReportRoot().endsWith(Paths.get("allure-report")));
    }

    @Test
    void throwsWhenSummaryMissing() throws Exception {
        Path folder = fixture("fixtures/empty-results");
        assertThrows(ReportNotFoundException.class, () -> ReportLocator.locate(folder));
    }

    @Test
    void resolvesNestedDashboard() throws Exception {
        Path folder = fixture("fixtures/dashboard-nested/report");
        LocatedReport located = ReportLocator.locate(folder);

        assertTrue(located.getDashboardPath().isPresent());
        assertTrue(located.getDashboardPath().get().endsWith("dashboard"));
    }

    @Test
    void resolvesSiblingDashboard() throws Exception {
        Path folder = fixture("fixtures/dashboard-sibling/allure-report");
        LocatedReport located = ReportLocator.locate(folder);

        assertTrue(located.getDashboardPath().isPresent());
        assertTrue(located.getDashboardPath().get().endsWith("allure-dashboard"));
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(ReportLocatorTest.class.getClassLoader().getResource(resource).toURI());
    }
}
