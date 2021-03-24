package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.client.publishers.MultiPartBodyPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.file.Paths;

import static com.github.guru.qa.allure.notifications.client.clients.BaseHttpClient.*;
import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.botToken;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.chatId;

public class TelegramClient implements Notifier {
    private static final Logger LOG = LoggerFactory.getLogger(TelegramClient.class);
    private static final HttpClient HTTP_CLIENT = httpClient();
    private final String URL = String.format("https://api.telegram.org/bot%s", botToken());

    @Override
    public void sendText() {
        String body = String.format("chat_id=%s&text=%s&parse_mode=Markdown", chatId(), formattedMessage());

        var request = formUrlEncodedRequest(URL + "/sendMessage", body).build();

        LOG.info("Request URL: {}\nRequest Body: {}", request.uri(), body);
        try {
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            LOG.info("Response Status Code: {}\nResponse Body:{}", response.statusCode(), response.body());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        MultiPartBodyPublisher publisher = new MultiPartBodyPublisher()
                .addPart("photo", Paths.get("piechart.png"))
                .addPart("chat_id", chatId())
                .addPart("parse_mode", "Markdown")
                .addPart("caption", formattedMessage());

        var request = multipartRequest(URL + "/sendPhoto", publisher.build(),
                publisher.getBoundary()).build();

        LOG.info("Request URL: {}\nRequest Multipart Data: {}", request.uri(), publisher.getPartsSpecificationList());
        try {
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            LOG.info("Response Status Code: {}\nResponse Body:{}", response.statusCode(), response.body());
        } catch (IOException | InterruptedException e) {
            LOG.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
