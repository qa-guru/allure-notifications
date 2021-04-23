package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import kong.unirest.Unirest;

import java.io.File;

import static com.github.guru.qa.allure.notifications.client.clients.interceptors.enums.Header.URL_ENCODED;
import static com.github.guru.qa.allure.notifications.message.Text.formattedMarkdownMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;

public class TelegramClient implements Notifier {
    private final String URL = "https://api.telegram.org/bot{token}";

    @Override
    public void sendText() {
        Unirest.post(URL + "/sendMessage")
                .routeParam("token", botToken())
                .header("Content-Type", URL_ENCODED.contentType())
                .field("chat_id", chatId())
                .field("reply_to_message_id", replyToMessageId() + "")
                .field("text", formattedMarkdownMessage())
                .field("parse_mode", "Markdown")
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
                .field("reply_to_message_id", replyToMessageId() + "")
                .field("parse_mode", "Markdown")
                .field("caption", formattedMarkdownMessage())
                .asString()
                .getBody();
    }
}
