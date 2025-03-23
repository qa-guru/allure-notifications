package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;

import org.junit.jupiter.api.Test;

import java.util.List;

import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

class TelegramClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";

    private final MockClient mock = MockClient.register();
    private final MessageData messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);

    @Test
    void topicIsSetTest() throws MessagingException {
        Telegram telegram = createConfig("topic");

        new TelegramClient(telegram).sendText(messageData);

        mock.assertThat(POST, "https://api.telegram.org/bottoken/sendMessage")
                .hadField("message_thread_id", "topic");
    }

    @Test
    void topicIsOptionalTest() throws MessagingException {
        Telegram telegram = createConfig(null);

        mock.expect(POST, "https://api.telegram.org/bottoken/sendMessage")
                .body(TelegramClientTest::hasNoMessageThreadIdParameter);

        new TelegramClient(telegram).sendText(messageData);

        mock.verifyAll();
    }

    @Test
    void topicIsSetForPhotoTest() throws MessagingException {
        Telegram telegram = createConfig("topic");

        new TelegramClient(telegram).sendPhoto(messageData, new byte[0]);

        mock.assertThat(POST, "https://api.telegram.org/bottoken/sendPhoto")
                .hadField("message_thread_id", "topic");
    }

    @Test
    void topicIsNotSetForPhotoTest() throws MessagingException {
        Telegram telegram = createConfig(null);

        mock.expect(POST, "https://api.telegram.org/bottoken/sendPhoto")
                .body(TelegramClientTest::hasNoMessageThreadIdParameter);

        new TelegramClient(telegram).sendPhoto(messageData, new byte[0]);

        mock.verifyAll();
    }

    private static MatchStatus hasNoMessageThreadIdParameter(List<String> body) {
        return new MatchStatus(
                body.stream()
                        .map(x -> x.split("=")[0])
                        .noneMatch(formParameterName -> formParameterName.equals("message_thread_id")),
                "No parameter 'message_thread_id' was expected, but found");
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
}
