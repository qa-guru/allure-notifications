package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.skype.SkypeClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.enums.Messenger;

import java.util.EnumMap;
import java.util.function.Function;

public class ClientFactory {
    private static final EnumMap<Messenger, Function<Config, Notifier>> factory =
            new EnumMap<>(Messenger.class);

    static {
        factory.put(Messenger.telegram, config -> new TelegramClient(config.base(), config.telegram()));
        factory.put(Messenger.slack, config -> new SlackClient(config.base(), config.slack()));
        factory.put(Messenger.email, config -> new Email(config.base(), config.mail()));
        factory.put(Messenger.mattermost, config -> new MattermostClient(config.base(), config.mattermost()));
        factory.put(Messenger.skype, config -> new SkypeClient(config.base(), config.skype()));
    }

    public static Notifier from(Config config) {
        return factory.get(config.base().messenger()).apply(config);
    }
}
