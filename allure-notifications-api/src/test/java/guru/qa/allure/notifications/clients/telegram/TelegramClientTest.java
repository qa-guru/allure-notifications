package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.MatchStatus;
import kong.unirest.MockClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static guru.qa.allure.notifications.clients.mail.EmailTests.EMPTY_TEMPLATE_PATH;
import static kong.unirest.HttpMethod.POST;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;

class TelegramClientTest {

    MockClient mock;
    MessageData messageData;

    @BeforeEach
    void setUp() {
        mock = MockClient.register();
        messageData = mock(MessageData.class, RETURNS_DEEP_STUBS);
    }

    @Test
    void topicIsSetTest() throws Exception {
        Telegram telegram = telegram("topic");

        new TelegramClient(telegram).sendText(messageData);

        mock.assertThat(POST, "https://api.telegram.org/bottoken/sendMessage")
                .hadField("message_thread_id", "topic");
    }

    @Test
    void topicIsOptionalTest() throws Exception {
        Telegram telegram = telegram(null);

        mock.expect(POST, "https://api.telegram.org/bottoken/sendMessage")
                .body(TelegramClientTest::hasNoMessageThreadIdParameter);

        new TelegramClient(telegram).sendText(messageData);

        mock.verifyAll();
    }

    @Test
    void topicIsSetForPhotoTest() throws Exception {
        Telegram telegram = telegram("topic");

        new TelegramClient(telegram).sendPhoto(messageData, new byte[0]);

        mock.assertThat(POST, "https://api.telegram.org/bottoken/sendPhoto")
                .hadField("message_thread_id", "topic");
    }

    @Test
    void topicIsNotSetForPhotoTest() throws Exception {
        Telegram telegram = telegram(null);

        mock.expect(POST, "https://api.telegram.org/bottoken/sendPhoto")
                .body(TelegramClientTest::hasNoMessageThreadIdParameter);

        new TelegramClient(telegram).sendPhoto(messageData, new byte[0]);

        mock.verifyAll();
    }

    private static MatchStatus hasNoMessageThreadIdParameter(List<String> body) {
        return new MatchStatus(body.stream().map(x -> x.split("=")[0]).noneMatch(x -> x.equals("message_thread_id")), "параметр не задан: " + "message_thread_id");
    }

    private static Telegram telegram(String topic) {
        Telegram telegram = new Telegram();
        telegram.setChat("chat");
        telegram.setTopic(topic);
        telegram.setToken("token");
        telegram.setReplyTo("reply-to");
        telegram.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return telegram;
    }
}