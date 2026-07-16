package guru.qa.allure.notifications.clients;

import static kong.unirest.HttpMethod.POST;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.config.telegram.Telegram;
import kong.unirest.MockClient;

/**
 * Integration-style smoke: real ReportLocator/SummaryReader/templates against fixtures,
 * HTTP mocked via Unirest MockClient.
 */
class NotificationSendIntegrationTest {

    private final MockClient http = MockClient.register();

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void sendsTelegramTextForAllure2Report(@TempDir Path chartDir) throws Exception {
        http.expect(POST, "https://api.telegram.org/bottoken/sendMessage");

        Config config = telegramConfig(
                fixture("fixtures/allure2-report").toString(),
                null,
                false);

        boolean ok = Notification.send(config, chartDir.toString());

        assertTrue(ok);
        http.verifyAll();
    }

    @Test
    void sendsTelegramPhotoCollageForAllure3WithResults(@TempDir Path chartDir) throws Exception {
        http.expect(POST, "https://api.telegram.org/bottoken/sendPhoto");

        Config config = telegramConfig(
                fixture("fixtures/allure3-report").toString(),
                fixture("fixtures/allure-results").toString(),
                true);
        config.getBase().getChart().setMode("collage");

        boolean ok = Notification.send(config, chartDir.toString());

        assertTrue(ok);
        http.verifyAll();
        assertTrue(chartDir.resolve("chart.png").toFile().isFile());
    }

    @Test
    void publishesSuitesFromResultsWhenWidgetsMissing() throws Exception {
        http.expect(POST, "https://api.telegram.org/bottoken/sendMessage");

        Config config = telegramConfig(
                fixture("fixtures/allure3-report").toString(),
                fixture("fixtures/allure-results").toString(),
                false);
        config.getBase().setEnableSuitesPublishing(true);

        // Capture template data via a stub notifier would be heavier; ensure send succeeds
        // and SuitesJsonBuilder path does not throw for A3 without widgets/suites.json.
        assertTrue(Notification.send(config));
        http.verifyAll();
    }

    private static Config telegramConfig(String allureFolder, String resultsFolder, boolean enableChart) {
        Config config = new Config();
        Base base = new Base();
        base.setProject("integration");
        base.setEnvironment("test");
        base.setComment("integration");
        base.setLanguage(Language.en);
        base.setAllureFolder(allureFolder);
        base.setAllureResultsFolder(resultsFolder);
        base.setEnableChart(enableChart);
        base.setEnableSuitesPublishing(false);
        if (enableChart) {
            guru.qa.allure.notifications.config.chart.ChartConfig chart =
                    new guru.qa.allure.notifications.config.chart.ChartConfig();
            chart.setMode("pie");
            base.setChart(chart);
        }
        config.setBase(base);

        Telegram telegram = new Telegram();
        telegram.setToken("token");
        telegram.setChat("chat");
        telegram.setReplyTo("0");
        telegram.setTemplatePath("/templates/telegram.ftl");
        config.setTelegram(telegram);
        return config;
    }

    private static Path fixture(String resource) throws URISyntaxException {
        return Paths.get(NotificationSendIntegrationTest.class.getClassLoader().getResource(resource).toURI());
    }
}
