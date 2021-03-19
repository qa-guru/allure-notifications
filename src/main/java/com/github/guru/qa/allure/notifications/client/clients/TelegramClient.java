package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;

import java.io.File;

import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.botToken;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.chatId;
import static io.restassured.RestAssured.given;

public class TelegramClient implements Notifier {
    @Override
    public void sendText() {
        // @formatter: off
        given()
            .log().body()
            .formParam("chat_id", chatId())
            .formParam("text", formattedMessage())
            .formParam("parse_mode", "Markdown")
        .when()
            .post("https://api.telegram.org/bot{token}/sendMessage", botToken())
        .then()
            .log().body();
        // @formatter: on
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        // @formatter: off
        given()
            .log().body()
            .multiPart("photo", new File("piechart.png"))
            .formParam("chat_id", chatId())
            .formParam("caption", formattedMessage())
            .formParam("parse_mode", "Markdown")
        .when()
            .post("https://api.telegram.org/bot{token}/sendPhoto", botToken())
        .then()
            .log().body();
        // @formatter: on
    }
}
