package guru.qa.allure.notifications.clients.mattermost;

import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.BodyMatcher;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;

class MattermostClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String HOST = "mattermost.example";
    private static final String POSTS_URL = "https://" + HOST + "/api/v4/posts";
    private static final String FILES_URL = "https://" + HOST + "/api/v4/files";

    private final MockClient http = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void sendTextPostsMessageToChannel() throws MessagingException {
        http.expect(POST, POSTS_URL)
                .body(bodyContains("channel-1", "message"));

        new MattermostClient(createConfig()).sendText(messageData);

        http.verifyAll();
        http.assertThat(POST, POSTS_URL)
                .hadHeader("Authorization", "Bearer mm-token")
                .hadHeader("Content-Type", "application/json");
    }

    @Test
    void sendPhotoUploadsFileThenPostsWithFileId() throws MessagingException {
        http.expect(POST, FILES_URL)
                .thenReturn("{\"file_infos\":[{\"id\":\"file-42\"}]}");
        http.expect(POST, POSTS_URL)
                .body(bodyContains("file-42", "channel-1"));

        new MattermostClient(createConfig()).sendPhoto(messageData, "PNG".getBytes());

        http.verifyAll();
        http.assertThat(POST, FILES_URL).hadHeader("Authorization", "Bearer mm-token");
    }

    private static Mattermost createConfig() {
        Mattermost mattermost = new Mattermost();
        mattermost.setUrl(HOST);
        mattermost.setToken("mm-token");
        mattermost.setChat("channel-1");
        mattermost.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return mattermost;
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
