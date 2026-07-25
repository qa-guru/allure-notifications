package guru.qa.allure.notifications.config.links;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;

class LinksResolverTest {

    @Test
    void mapsDeprecatedReportLinkToReport() {
        Base base = new Base();
        base.setReportLink("https://example.com/report/");

        Map<String, String> links = LinksResolver.resolve(base);

        assertEquals(1, links.size());
        assertEquals("https://example.com/report/allure", links.get("report"));
    }

    @Test
    void prefersLinksBlockOverDeprecatedReportLink() {
        Base base = new Base();
        base.setReportLink("https://legacy.example.com");
        Links configLinks = new Links();
        configLinks.setReport("https://new.example.com");
        configLinks.setDashboard("https://dashboard.example.com");
        configLinks.setTestops("https://testops.example.com");
        configLinks.setBuild("https://ci.example.com/job/1");
        base.setLinks(configLinks);

        Map<String, String> links = LinksResolver.resolve(base);

        assertEquals(4, links.size());
        assertEquals("https://new.example.com", links.get("report"));
        assertEquals("https://dashboard.example.com", links.get("dashboard"));
        assertEquals("https://testops.example.com", links.get("testops"));
        assertEquals("https://ci.example.com/job/1", links.get("build"));
    }

    @Test
    void skipsBlankLinks() {
        Base base = new Base();
        Links configLinks = new Links();
        configLinks.setReport("  ");
        configLinks.setBuild("https://ci.example.com");
        base.setLinks(configLinks);

        Map<String, String> links = LinksResolver.resolve(base);

        assertEquals(1, links.size());
        assertEquals("https://ci.example.com", links.get("build"));
        assertFalse(links.containsKey("report"));
    }

    @Test
    void returnsEmptyWhenNoLinksConfigured() {
        Base base = new Base();
        assertTrue(LinksResolver.resolve(base).isEmpty());
    }
}
