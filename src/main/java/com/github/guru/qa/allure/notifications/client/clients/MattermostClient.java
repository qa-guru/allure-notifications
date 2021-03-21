package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;
import static io.restassured.RestAssured.given;
import static java.util.Collections.singletonList;

public class MattermostClient implements Notifier {
    Map<String, Object> body = new HashMap<>();

    @Override
    public void sendText() {
        body.put("channel_id", chatId());
        body.put("message", formattedMessage());
        // @formatter: off
        given()
            .log().body()
            .header("Authorization", "Bearer " + botToken())
            .body(body)
        .when()
            .post("https://" + mattermostApiUrl() + "/api/v4/posts")
        .then()
            .log().body();
        // @formatter: on
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        // @formatter: off
        String chartImageId =
                given()
                    .header("Authorization", "Bearer " + botToken())
                    .queryParam("channel_id", chatId())
                    .queryParam("filename", "piechart")
                    .multiPart("piechart", new File("piechart.png"))
                .when()
                    .post("https://" + mattermostApiUrl() + "/api/v4/files")
                .then()
                    .extract().jsonPath().getList("file_infos.id").get(0).toString();

        body.put("file_ids", singletonList(chartImageId));
        sendText();
        // @formatter: on
    }
}
