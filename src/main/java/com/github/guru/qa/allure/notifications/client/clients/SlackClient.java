package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import kong.unirest.Unirest;

import java.io.File;

import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.botToken;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.chatId;

public class SlackClient implements Notifier {
    private static final String URL = "https://slack.com/api";

    @Override
    public void sendText() {
        String body = String.format("channel=%s&text=%s",
                chatId(), formattedMessage());
        Unirest.post(URL + "/chat.postMessage")
                .header("Authorization", "Bearer " + botToken())
                .header("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Unirest.post(URL + "/files.upload")
                .header("Authorization", "Bearer " + botToken())
                .field("file", new File("piechart.png"))
                .field("channels", chatId())
                .field("title", "")
                .field("initial_comment", formattedMessage())
                .asString()
                .getBody();
    }
}