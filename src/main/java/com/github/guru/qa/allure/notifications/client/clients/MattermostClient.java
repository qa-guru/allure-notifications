package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.client.publishers.MultiPartBodyPublisher;
import com.jayway.jsonpath.JsonPath;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static com.github.guru.qa.allure.notifications.client.clients.BaseHttpClient.*;
import static com.github.guru.qa.allure.notifications.message.Text.formattedMarkdownMessage;
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
        body.put("message", formattedMarkdownMessage());

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
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        String query = String.format("/files?channel_id=%s&filename=%s", chatId(), "piechart");
        MultiPartBodyPublisher publisher = new MultiPartBodyPublisher()
                .addPart("piechart", Paths.get("piechart.png"));

        var request = multipartRequest(URL + query, publisher.build(),
                publisher.getBoundary())
                .header("Authorization", "Bearer " + botToken())
                .build();

        LOG.info("Request URL: {}\nRequest Multipart Data: {}", request.uri(), publisher.getPartsSpecificationList());
        try {
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            LOG.info("Response Status Code: {}\nResponse Body:{}", response.statusCode(), response.body());

            String chartId = JsonPath.read(response.body(), "$.file_infos[0].id");
            body.put("file_ids", singletonList(chartId));
            sendText();
        } catch (IOException | InterruptedException e) {
            LOG.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
