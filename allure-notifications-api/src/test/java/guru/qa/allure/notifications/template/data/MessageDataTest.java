package guru.qa.allure.notifications.template.data;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.links.Links;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;

class MessageDataTest {

    @Test
    void exposesLinksMapAndLegacyReportLink() throws Exception {
        Base base = new Base();
        Links links = new Links();
        links.setReport("https://report.example.com");
        links.setDashboard("https://dashboard.example.com");
        base.setLinks(links);

        JSON json = new JSON();
        Summary summary = json.parseResource("/data/testSummary.json", Summary.class);
        Phrases phrases = json.parseResource("/phrases/en.json", Phrases.class);

        Map<String, Object> values = new MessageData(base, summary, null, phrases).getValues();

        @SuppressWarnings("unchecked")
        Map<String, String> resolvedLinks = (Map<String, String>) values.get("links");
        assertEquals("https://report.example.com", resolvedLinks.get("report"));
        assertEquals("https://dashboard.example.com", resolvedLinks.get("dashboard"));
        assertFalse(resolvedLinks.containsKey("testops"));
        assertEquals("https://report.example.com", values.get("reportLink"));
    }

    @Test
    void putsEmptyLinksMapWhenNoneConfigured() throws Exception {
        Base base = new Base();
        JSON json = new JSON();
        Summary summary = json.parseResource("/data/testSummary.json", Summary.class);
        Phrases phrases = json.parseResource("/phrases/en.json", Phrases.class);

        Map<String, Object> values = new MessageData(base, summary, null, phrases).getValues();

        @SuppressWarnings("unchecked")
        Map<String, String> resolvedLinks = (Map<String, String>) values.get("links");
        assertTrue(resolvedLinks.isEmpty());
        assertFalse(values.containsKey("reportLink"));
    }
}
