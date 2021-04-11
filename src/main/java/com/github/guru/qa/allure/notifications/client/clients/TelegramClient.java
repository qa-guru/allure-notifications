package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import kong.unirest.Unirest;

import java.io.File;

import static com.github.guru.qa.allure.notifications.message.Text.formattedMarkdownMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.botToken;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.chatId;

public class TelegramClient implements Notifier {
    private final String URL = "https://api.telegram.org/bot{token}";

    @Override
    public void sendText() {
        String body = String.format("chat_id=%s&text=%s&parse_mode=Markdown", chatId(), formattedMarkdownMessage());
        Unirest.post(URL + "/sendMessage")
                .routeParam("token", botToken())
                .header("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Unirest.post(URL + "/sendPhoto")
                .routeParam("token", botToken())
                .field("photo", new File("piechart.png"))
                .field("chat_id", chatId())
                .field("parse_mode", "Markdown")
                .field("caption", formattedMarkdownMessage())
                .asString()
                .getBody();
    }
}
