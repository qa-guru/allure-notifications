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
import java.util.HashMap;
import java.util.Map;

import static com.github.guru.qa.allure.notifications.client.clients.BaseHttpClient.*;
import static com.github.guru.qa.allure.notifications.message.Text.formattedMessage;
import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.convertMapToJSON;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;
import static java.util.Collections.singletonList;

public class MattermostClient implements Notifier {
    private static final Logger LOG = LoggerFactory.getLogger(MattermostClient.class);
    private static final HttpClient HTTP_CLIENT = httpClient();
    private final String URL = String.format("https://%s/api/v4", mattermostApiUrl());
    private Map<String, Object> body = new HashMap<>();

    @Override
    public void sendText() {
        body.put("channel_id", chatId());
        body.put("message", formattedMessage());

        var request = jsonRequest(URL + "/posts", convertMapToJSON(body))
                .header("Authorization", "Bearer " + botToken()).build();

        LOG.info("Request URL: {}\nRequest Body: {}", request.uri(), body);
        try {
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            LOG.info("Response Status Code: {}\nResponse Body:{}", response.statusCode(), response.body());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            System.exit(1);
        }
//        // @formatter: off
//        given()
//            .log().body()
//            .header("Authorization", "Bearer " + botToken())
//            .body(body)
//         .when()
//            .post("https://{url}/api/v4/posts", mattermostApiUrl())
//         .then()
//            .log().body();
//        // @formatter: on
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        MultiPartBodyPublisher publisher = new MultiPartBodyPublisher()
                .addPart("piechart", Paths.get("piechart.png"))
                .addPart("channel_id", chatId())
                .addPart("filename", "piechart");

        var request = multipartRequest(URL + "/files", publisher.build(),
                publisher.getBoundary())
                .header("Authorization", "Bearer " + botToken())
                .build();

        LOG.info("Request URL: {}\nRequest Multipart Data: {}", request.uri(), publisher.getPartsSpecificationList());
        try {
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            LOG.info("Response Status Code: {}\nResponse Body:{}", response.statusCode(), response.body());
            //TODO: add here file ID extraction
            String chartId = "";
            body.put("file_ids", singletonList(chartId));
            sendText();
        } catch (IOException | InterruptedException e) {
            LOG.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
//        // @formatter: off
//        String chartImageId =
//                given()
//                    .header("Authorization", "Bearer " + botToken())
//                    .queryParam("channel_id", chatId())
//                    .queryParam("filename", "piechart")
//                    .multiPart("piechart", new File("piechart.png"))
//                .when()
//                    .post("https://{url}/api/v4/files", mattermostApiUrl())
//                .then()
//                    .extract()
//                    .jsonPath()
//                    .getList("file_infos.id")
//                    .get(0).toString();
//        // @formatter: on
//        body.put("file_ids", singletonList(chartImageId));
//        sendText();
    }
}
