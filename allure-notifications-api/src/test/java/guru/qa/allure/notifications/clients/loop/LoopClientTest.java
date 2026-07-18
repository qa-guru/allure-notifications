package guru.qa.allure.notifications.clients.loop;

import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.loop.Loop;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.BodyMatcher;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;

class LoopClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String WEBHOOK_URL = "https://loop.example/hooks/abc";

    private final MockClient http = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void sendTextPostsJsonWithText() throws MessagingException {
        http.expect(POST, WEBHOOK_URL)
                .body(bodyContains("\"text\""));

        new LoopClient(createConfig()).sendText(messageData);

        http.verifyAll();
        http.assertThat(POST, WEBHOOK_URL).hadHeader("Content-Type", "application/json");
    }

    @Test
    void sendPhotoEmbedsBase64Attachment() throws MessagingException {
        http.expect(POST, WEBHOOK_URL)
                .body(bodyContains("data:image/png;base64,", "attachments"));

        new LoopClient(createConfig()).sendPhoto(messageData, "PNG".getBytes());

        http.verifyAll();
    }

    private static Loop createConfig() {
        Loop loop = new Loop();
        loop.setWebhookUrl(WEBHOOK_URL);
        loop.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return loop;
    }

    private static BodyMatcher bodyContains(String... fragments) {
        return body -> {
            String joined = String.join("\n", body);
            for (String fragment : fragments) {
                if (!joined.contains(fragment)) {
                    return new MatchStatus(false, "Expected body to contain '" + fragment + "', but was: " + joined);
                }
            }
            return new MatchStatus(true, "OK");
        };
    }
}
