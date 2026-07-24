package guru.qa.allure.notifications.clients.telegram;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.StatusLine;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.http.HttpClientFactory;
import guru.qa.allure.notifications.template.data.MessageData;

class TelegramClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";

    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @Test
    void sendTextPostsMessageWhenHttpOk() throws Exception {
        Telegram telegram = createConfig("topic");
        CloseableHttpClient client = mockClientWithOkResponse();

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);
            assertDoesNotThrow(() -> new TelegramClient(telegram, null).sendText(messageData));
        }
    }

    @Test
    void sendPhotoPostsMultipartWhenHttpOk() throws Exception {
        Telegram telegram = createConfig("topic");
        CloseableHttpClient client = mockClientWithOkResponse();

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);
            assertDoesNotThrow(() -> new TelegramClient(telegram, null).sendPhoto(messageData, "PNG".getBytes()));
        }
    }

    @Test
    void sendTextUsesConfiguredProxy() throws Exception {
        Telegram telegram = createConfig(null);
        Proxy proxy = createProxy();
        CloseableHttpClient client = mockClientWithOkResponse();

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(proxy)).thenReturn(client);
            new TelegramClient(telegram, proxy).sendText(messageData);
            factory.verify(() -> HttpClientFactory.createHttpClient(eq(proxy)));
        }
    }

    @Test
    void topicIsSetTest() throws Exception {
        Telegram telegram = createConfig("topic");
        CloseableHttpClient client = mockClientWithOkResponse();
        ArgumentCaptor<HttpUriRequest> requestCaptor = ArgumentCaptor.forClass(HttpUriRequest.class);
        when(client.execute(requestCaptor.capture())).thenReturn(mock(CloseableHttpResponse.class));

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            new TelegramClient(telegram, null).sendText(messageData);

            Map<String, String> formData = readFormData(requestCaptor.getValue());
            assertTrue(formData.containsKey("message_thread_id"));
            assertEquals("topic", formData.get("message_thread_id"));
        }
    }

    @Test
    void topicIsOptionalTest() throws Exception {
        Telegram telegram = createConfig(null);
        CloseableHttpClient client = mockClientWithOkResponse();
        ArgumentCaptor<HttpUriRequest> requestCaptor = ArgumentCaptor.forClass(HttpUriRequest.class);
        when(client.execute(requestCaptor.capture())).thenReturn(mock(CloseableHttpResponse.class));

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            new TelegramClient(telegram, null).sendText(messageData);

            assertFalse(readFormData(requestCaptor.getValue()).containsKey("message_thread_id"));
        }
    }

    @Test
    void topicIsSetForPhotoTest() throws Exception {
        Telegram telegram = createConfig("topic");
        CloseableHttpClient client = mockClientWithOkResponse();
        ArgumentCaptor<HttpUriRequest> requestCaptor = ArgumentCaptor.forClass(HttpUriRequest.class);
        when(client.execute(requestCaptor.capture())).thenReturn(mock(CloseableHttpResponse.class));

        try (MockedStatic<HttpClientFactory> factory = mockStatic(HttpClientFactory.class)) {
            factory.when(() -> HttpClientFactory.createHttpClient(any())).thenReturn(client);

            new TelegramClient(telegram, null).sendPhoto(messageData, new byte[0]);

            assertTrue(requestCaptor.getValue().getURI().toString().endsWith("/sendPhoto"));
        }
    }

    private static CloseableHttpClient mockClientWithOkResponse() throws IOException {
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

    private static Map<String, String> readFormData(HttpUriRequest request) throws Exception {
        HttpEntity entity = ((org.apache.http.HttpEntityEnclosingRequest) request).getEntity();
        if (!(entity instanceof UrlEncodedFormEntity)) {
            return new HashMap<>();
        }
        String body = EntityUtils.toString(entity);
        Map<String, String> formData = new HashMap<>();
        if (body.isEmpty()) {
            return formData;
        }
        for (String part : body.split("&")) {
            String[] pair = part.split("=", 2);
            String value = pair.length > 1
                    ? java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8.name())
                    : "";
            formData.put(pair[0], value);
        }
        return formData;
    }

    private static Telegram createConfig(String topic) {
        Telegram telegram = new Telegram();
        telegram.setChat("chat");
        telegram.setTopic(topic);
        telegram.setToken("token");
        telegram.setReplyTo("reply-to");
        telegram.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return telegram;
    }

    private static Proxy createProxy() {
        Proxy proxy = new Proxy();
        proxy.setType("socks5");
        proxy.setHost("proxy.qaguru.school");
        proxy.setPort(7777);
        return proxy;
    }
}
