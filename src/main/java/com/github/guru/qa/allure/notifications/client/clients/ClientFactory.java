package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.config.enums.Messenger;

import java.util.EnumMap;
import java.util.function.Supplier;

import static com.github.guru.qa.allure.notifications.config.enums.Messenger.*;

public class ClientFactory {
    private static final EnumMap<Messenger, Supplier<Notifier>> client =
            new EnumMap<>(Messenger.class);
    static {
        client.put(telegram, TelegramClient::new);
        client.put(slack, SlackClient::new);
        client.put(mattermost, MattermostClient::new);
        client.put(email, EmailClient::new);
    }

    public static Notifier create(Messenger messenger) {
        return client.get(messenger).get();
    }
}
