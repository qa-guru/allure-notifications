package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.skype.Skype;
import guru.qa.allure.notifications.clients.slack.Slack;
import guru.qa.allure.notifications.clients.telegram.Telegram;

import java.util.EnumMap;
import java.util.function.Supplier;

public class ClientFactory {
    private static final EnumMap<Messenger, Supplier<Notifier>> factory =
            new EnumMap<>(Messenger.class);

    static {
        factory.put(Messenger.telegram, Telegram::new);
        factory.put(Messenger.slack, Slack::new);
        factory.put(Messenger.email, Email::new);
        factory.put(Messenger.mattermost, MattermostClient::new);
        factory.put(Messenger.skype, Skype::new);
    }

    public static Notifier initClientFor(Messenger messenger) {
        return factory.get(messenger).get();
    }
}
