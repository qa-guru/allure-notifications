package guru.qa.allure.notifications.clients.teams;

import guru.qa.allure.notifications.config.teams.Teams;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.BodyMatcher;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static kong.unirest.HttpMethod.POST;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

class TeamsClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String WEBHOOK_URL = "https://example.webhook.office.com/webhookb2/test";

    private final MockClient http = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void defaultTemplatePathIsTeamsFtl() {
        Teams teams = new Teams();
        assertEquals("/templates/teams.ftl", teams.getTemplatePath());
    }

    @Test
    void sendTextPostsAdaptiveCardWithoutImage() throws MessagingException {
        Teams teams = createConfig();
        http.expect(POST, WEBHOOK_URL)
                .body(bodyContainsAll("AdaptiveCard", "TextBlock"))
                .body(bodyContainsNone("Image"));

        new TeamsClient(teams).sendText(messageData);

        http.verifyAll();
        http.assertThat(POST, WEBHOOK_URL).hadHeader("Content-Type", "application/json");
    }

    @Test
    void sendPhotoEmbedsBase64ImageInAdaptiveCard() throws MessagingException {
        Teams teams = createConfig();
        byte[] chart = "PNG".getBytes();
        http.expect(POST, WEBHOOK_URL)
                .body(bodyContainsAll("AdaptiveCard", "TextBlock", "Image", "data:image/png;base64,UE5H"));

        new TeamsClient(teams).sendPhoto(messageData, chart);

        http.verifyAll();
    }

    private static Teams createConfig() {
        Teams teams = new Teams();
        teams.setWebhookUrl(WEBHOOK_URL);
        teams.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return teams;
    }

    private static BodyMatcher bodyContainsAll(String... fragments) {
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

    private static BodyMatcher bodyContainsNone(String... fragments) {
        return body -> {
            String joined = String.join("\n", body);
            for (String fragment : fragments) {
                if (joined.contains(fragment)) {
                    return new MatchStatus(false,
                            "Expected body to NOT contain '" + fragment + "', but was: " + joined);
                }
            }
            return new MatchStatus(true, "OK");
        };
    }
}
