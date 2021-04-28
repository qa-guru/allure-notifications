package com.github.guru.qa.allure.notifications;

import com.github.guru.qa.allure.notifications.client.NotificationManager;
import com.github.guru.qa.allure.notifications.client.clients.interceptors.UnirestLogInterceptor;
import com.github.guru.qa.allure.notifications.utils.Journal;
import kong.unirest.Unirest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Application {
    private static final Logger LOG = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        Journal.buildInfo();
        Journal.settings();
        Journal.mailSetting();
        Journal.proxySetting();

        LOG.info("Start application.");
        Unirest.config()
                .interceptor(new UnirestLogInterceptor());
        NotificationManager.sendMessage();
        Unirest.shutDown();
        LOG.info("Stop application.");
    }
}
