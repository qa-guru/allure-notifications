package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;

import java.io.File;

import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.botToken;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.chatId;
import static io.restassured.RestAssured.given;

public class SlackClient implements Notifier {
    @Override
    public void sendText() {
        //@formatter: off
        given()
            .header("Authorization", "Bearer " + botToken())
            .contentType("application/x-www-form-urlencoded;charset=utf-8")
            .formParam("channel", chatId())
            .formParam("text", formattedMessage())
        .when()
            .post("https://slack.com/api/chat.postMessage")
        .then()
            .log().body();
        //@formatter: on
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        //@formatter: off
        given()
            .header("Authorization", "Bearer " + botToken())
            .multiPart("file", new File("piechart.png"))
            .formParam("channel", chatId())
            .formParam("initial_comment", formattedMessage())
        .when()
            .post("https://slack.com/api/files.upload")
        .then()
            .log().body();
        //@formatter: on
    }
}