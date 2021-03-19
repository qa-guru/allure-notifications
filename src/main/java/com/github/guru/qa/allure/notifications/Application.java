package com.github.guru.qa.allure.notifications;

import com.github.guru.qa.allure.notifications.client.NotificationManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Application {
    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        LOGGER.info("Start application");
        NotificationManager.sendMessage();
        LOGGER.info("Stop application");
    }
}
