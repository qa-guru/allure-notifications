package guru.qa.allure.notifications.clients.slack;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.when;

import org.apache.http.HttpEntity;
import org.apache.http.StatusLine;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.http.HttpClientFactory;
import guru.qa.allure.notifications.template.data.MessageData;

class SlackClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";

    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @Test
    void sendTextPostsChatMessageWhenHttpOk() throws Exception {
        Slack slack = createConfig();
        CloseableHttpClient client = mock(CloseableHttpClient.class);
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        StatusLine statusLine = mock(StatusLine.class);
        HttpEntity entity = mock(HttpEntity.class);

        when(client.execute(any(HttpUriRequest.class))).thenReturn(response);
        when(response.getStatusLine()).thenReturn(statusLine);
        when(statusLine.getStatusCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(entity);

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class);
             MockedStatic<EntityUtils> entityUtils = mockStatic(EntityUtils.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);
            entityUtils.when(() -> EntityUtils.toString(entity)).thenReturn("{\"ok\":true}");

            assertDoesNotThrow(() -> new SlackClient(slack, null).sendText(messageData));
        }
    }

    @Test
    void sendPhotoCompletesExternalUploadFlow() throws Exception {
        Slack slack = createConfig();
        CloseableHttpClient client = mock(CloseableHttpClient.class);
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        StatusLine statusLine = mock(StatusLine.class);
        HttpEntity entity = mock(HttpEntity.class);

        when(client.execute(any(HttpUriRequest.class))).thenReturn(response);
        when(response.getStatusLine()).thenReturn(statusLine);
        when(statusLine.getStatusCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(entity);

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class);
             MockedStatic<EntityUtils> entityUtils = mockStatic(EntityUtils.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);
            entityUtils.when(() -> EntityUtils.toString(entity)).thenReturn(
                    "{\"ok\":true,\"file_id\":\"F1\",\"upload_url\":\"https://files.slack.com/upload\"}");

            assertDoesNotThrow(() -> new SlackClient(slack, null).sendPhoto(messageData, "PNG".getBytes()));
        }
    }

    private static Slack createConfig() {
        Slack slack = new Slack();
        slack.setToken("xoxb-token");
        slack.setChat("C123");
        slack.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return slack;
    }
}
