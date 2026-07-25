package guru.qa.allure.notifications.clients.discord;

import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.discord.Discord;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.MockClient;

class DiscordClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String MESSAGES_URL = "https://discord.com/api/channels/channel-1/messages";

    private final MockClient http = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @AfterEach
    void tearDown() {
        MockClient.clear();
    }

    @Test
    void sendTextPostsToChannelMessages() throws MessagingException {
        http.expect(POST, MESSAGES_URL);

        new DiscordClient(createConfig()).sendText(messageData);

        http.verifyAll();
        http.assertThat(POST, MESSAGES_URL)
                .hadHeader("Authorization", "Bot bot-token");
    }

    @Test
    void sendPhotoAttachesChartPng() throws MessagingException {
        http.expect(POST, MESSAGES_URL);

        new DiscordClient(createConfig()).sendPhoto(messageData, "PNG".getBytes());

        http.verifyAll();
        http.assertThat(POST, MESSAGES_URL)
                .hadHeader("Authorization", "Bot bot-token");
    }

    private static Discord createConfig() {
        Discord discord = new Discord();
        discord.setBotToken("bot-token");
        discord.setChannelId("channel-1");
        discord.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return discord;
    }
}
