package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.skype.SkypeClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.enums.Messenger;

import java.util.EnumMap;
import java.util.function.Supplier;

public class ClientFactory {
    private static final EnumMap<Messenger, Supplier<Notifier>> factory =
            new EnumMap<>(Messenger.class);

    static {
        factory.put(Messenger.telegram, TelegramClient::new);
        factory.put(Messenger.slack, SlackClient::new);
        factory.put(Messenger.email, Email::new);
        factory.put(Messenger.mattermost, MattermostClient::new);
        factory.put(Messenger.skype, SkypeClient::new);
    }

    public static Notifier from(Messenger messenger) {
        return factory.get(messenger).get();
    }
}
