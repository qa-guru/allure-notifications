package guru.qa.allure.notifications.clients;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.http.HttpEntity;
import org.apache.http.StatusLine;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.MockedStatic;

import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.http.HttpClientFactory;

/**
 * Integration-style smoke: real ReportLocator/SummaryReader/templates against fixtures,
 * HTTP mocked via Apache HttpClient.
 */
class NotificationSendIntegrationTest {

    @Test
    void sendsTelegramTextForAllure2Report(@TempDir Path chartDir) throws Exception {
        CloseableHttpClient client = mockHttpClient();
        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            Config config = telegramConfig(
                    fixture("fixtures/allure2-report").toString(),
                    null,
                    false);

            assertTrue(Notification.send(config, chartDir.toString()));
        }
    }

    @Test
    void sendsTelegramPhotoCollageForAllure3WithResults(@TempDir Path chartDir) throws Exception {
        CloseableHttpClient client = mockHttpClient();
        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            Config config = telegramConfig(
                    fixture("fixtures/allure3-report").toString(),
                    fixture("fixtures/allure-results").toString(),
                    true);
            config.getBase().getChart().setMode("collage");

            assertTrue(Notification.send(config, chartDir.toString()));
            assertTrue(chartDir.resolve("chart.png").toFile().isFile());
        }
    }

    @Test
    void publishesSuitesFromResultsWhenWidgetsMissing() throws Exception {
        CloseableHttpClient client = mockHttpClient();
        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            Config config = telegramConfig(
                    fixture("fixtures/allure3-report").toString(),
                    fixture("fixtures/allure-results").toString(),
                    false);
            config.getBase().setEnableSuitesPublishing(true);

            assertTrue(Notification.send(config));
        }
    }

    private static CloseableHttpClient mockHttpClient() throws Exception {
        CloseableHttpClient client = mock(CloseableHttpClient.class);
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        StatusLine statusLine = mock(StatusLine.class);
        HttpEntity entity = mock(HttpEntity.class);

        when(client.execute(any(HttpUriRequest.class))).thenReturn(response);
        when(response.getStatusLine()).thenReturn(statusLine);
        when(statusLine.getStatusCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(entity);
        return client;
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
