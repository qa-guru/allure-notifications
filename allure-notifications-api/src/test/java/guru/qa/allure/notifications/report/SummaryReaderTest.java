package guru.qa.allure.notifications.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.summary.Summary;

class SummaryReaderTest {

    @Test
    void readsAllure2Summary() throws Exception {
        Path folder = fixture("fixtures/allure2-report");
        LocatedReport located = ReportLocator.locate(folder);
        Summary summary = SummaryReader.read(new JSON(), located);

        assertNotNull(summary.getStatistic());
        assertEquals(2, summary.getStatistic().getPassed());
        assertEquals(1, summary.getStatistic().getFailed());
        assertEquals(0, summary.getStatistic().getUnknown());
        assertEquals(3, summary.getStatistic().getTotal());
        assertEquals(24011L, summary.getTime().getDuration());
    }

    @Test
    void readsAllure3SummaryAndMapsToLegacyModel() throws Exception {
        Path folder = fixture("fixtures/allure3-report");
        LocatedReport located = ReportLocator.locate(folder);
        Summary summary = SummaryReader.read(new JSON(), located);

        assertNotNull(summary.getStatistic());
        assertEquals(8, summary.getStatistic().getPassed());
        assertEquals(1, summary.getStatistic().getFailed());
        assertEquals(0, summary.getStatistic().getBroken());
        assertEquals(1, summary.getStatistic().getSkipped());
        assertEquals(0, summary.getStatistic().getUnknown());
        assertEquals(10, summary.getStatistic().getTotal());
        assertEquals(24011L, summary.getTime().getDuration());
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(SummaryReaderTest.class.getClassLoader().getResource(resource).toURI());
    }
}
