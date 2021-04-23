package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.client.clients.interceptors.enums.Header;
import com.jayway.jsonpath.JsonPath;
import kong.unirest.Unirest;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static com.github.guru.qa.allure.notifications.client.clients.interceptors.enums.Header.JSON;
import static com.github.guru.qa.allure.notifications.message.Text.formattedMarkdownMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;
import static java.util.Collections.singletonList;

public class MattermostClient implements Notifier {
    private final String URL = "https://{uri}/api/v4";
    private Map<String, Object> body = new HashMap<>();

    @Override
    public void sendText() {
        body.put("channel_id", chatId());
        body.put("message", formattedMarkdownMessage());
        Unirest.post(URL + "/posts")
                .routeParam("uri", mattermostApiUrl())
                .header("Authorization", "Bearer " + botToken())
                .header("Content-Type", JSON.contentType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        String response = Unirest.post(URL + "/files")
                .routeParam("uri", mattermostApiUrl())
                .header("Authorization", "Bearer " + botToken())
                .queryString("channel_id", chatId())
                .queryString("filename", "piechart")
                .field("piechart", new File("piechart.png"))
                .asString()
                .getBody();
        String chartId = JsonPath.read(response, "$.file_infos[0].id");
        body.put("file_ids", singletonList(chartId));
        sendText();
    }
}
