package guru.qa.allure.notifications.clients.rocket;

import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.rocket.RocketChat;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.BodyMatcher;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;

class RocketChatClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String BASE_URL = "https://rocket.example";
    private static final String POST_MESSAGE_URL = BASE_URL + "/api/v1/chat.postMessage";
    private static final String UPLOAD_URL = BASE_URL + "/api/v1/rooms.upload/#general";

    private final MockClient http = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void sendTextPostsToChatPostMessage() throws MessagingException {
        http.expect(POST, POST_MESSAGE_URL)
                .body(bodyContains("#general", "text"));

        new RocketChatClient(createConfig()).sendText(messageData);

        http.verifyAll();
        http.assertThat(POST, POST_MESSAGE_URL)
                .hadHeader("X-Auth-Token", "auth-token")
                .hadHeader("X-User-Id", "user-1")
                .hadHeader("Content-Type", "application/json");
    }

    @Test
    void sendPhotoPostsTextThenUploadsFile() throws MessagingException {
        http.expect(POST, POST_MESSAGE_URL);
        http.expect(POST, UPLOAD_URL);

        new RocketChatClient(createConfig()).sendPhoto(messageData, "PNG".getBytes());

        http.verifyAll();
        http.assertThat(POST, UPLOAD_URL)
                .hadHeader("X-Auth-Token", "auth-token")
                .hadHeader("X-User-Id", "user-1");
    }

    private static RocketChat createConfig() {
        RocketChat rocket = new RocketChat();
        rocket.setUrl(BASE_URL);
        rocket.setToken("auth-token");
        rocket.setUserId("user-1");
        rocket.setChannel("#general");
        rocket.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return rocket;
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
