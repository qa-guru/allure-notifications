package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.config.enums.Messenger;

public class ClientFactory {
    public static Notifier initClient(Messenger messenger) {
        switch (messenger) {
            case telegram: return new TelegramClient();
            case slack: return new SlackClient();
            case mattermost: return new MattermostClient();
            case email: return new EmailClient();
            default: throw new IllegalArgumentException("Unknown messenger " + messenger);
        }
    }
}
