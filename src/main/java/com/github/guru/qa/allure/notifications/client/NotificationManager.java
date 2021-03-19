package com.github.guru.qa.allure.notifications.client;

import com.github.guru.qa.allure.notifications.client.clients.ClientFactory;

import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.enableChart;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.messenger;

public class NotificationManager {
    public static void sendMessage() {
        Notifier notifier = ClientFactory.initClient(messenger());
        if (enableChart()) {
            notifier.sendPhoto();
        } else {
            notifier.sendText();
        }
    }
}
