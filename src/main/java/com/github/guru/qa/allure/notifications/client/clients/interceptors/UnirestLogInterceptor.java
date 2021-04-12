package com.github.guru.qa.allure.notifications.client.clients.interceptors;

import kong.unirest.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.github.guru.qa.allure.notifications.client.clients.interceptors.enums.Header.URL_ENCODED;
import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.prettyPrint;

public class UnirestLogInterceptor implements Interceptor {
    private final Logger log = LoggerFactory.getLogger("Client");

    @Override
    public void onRequest(HttpRequest<?> request, Config config) {
        log.info("\n===REQUEST===\nURL: {}", request.getUrl());
        request.getBody().ifPresent(body ->
                logRequestBody(body, request.getHeaders()));
    }

    @Override
    public void onResponse(HttpResponse<?> response, HttpRequestSummary request, Config config) {
        log.info("\n===RESPONSE===\nSTATUS CODE: {}\nBODY: \n{}",
                response.getStatus(),
                prettyPrint(response.getBody().toString()));
    }

    private void logRequestBody(Body body, Headers headers) {
        if (body.isMultiPart()) {
            log.info("BODY: \n{}", body.multiParts());
            return;
        }
        if (headers.get("Content-Type").contains(URL_ENCODED.contentType())) {
            log.info("BODY: \n{}", body.uniPart());
            return;
        }
        log.info("BODY: \n{}", prettyPrint(body.uniPart().toString()));
    }
}
