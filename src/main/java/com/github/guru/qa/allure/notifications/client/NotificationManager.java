package com.github.guru.qa.allure.notifications.client;

import com.github.guru.qa.allure.notifications.client.clients.ClientFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.enableChart;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.messenger;

public class NotificationManager {
    private static final Logger LOG = LoggerFactory.getLogger(NotificationManager.class);

    public static void sendMessage() {
        Notifier notifier = ClientFactory.create(messenger());
        if (enableChart()) {
            LOG.info("Sending text message with photo attachment.");
            notifier.sendPhoto();
        } else {
            LOG.info("Sending text message.");
            notifier.sendText();
        }
        LOG.info("Finish.");
    }
}
