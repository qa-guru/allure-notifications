package com.github.guru.qa.allure.notifications.client.clients.interceptors;

import kong.unirest.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

import static com.github.guru.qa.allure.notifications.utils.JsonSlurper.prettyPrint;

public class UnirestLogInterceptor implements Interceptor {
    private final Logger log = LoggerFactory.getLogger("Client");

    @Override
    public void onRequest(HttpRequest<?> request, Config config) {
        log.info("REQUEST\nURL: {}\nHEADERS: {}", request.getUrl(),
                request.getHeaders());
        Optional<Body> requestBody = request.getBody();
        if (requestBody.isPresent()) {
            Body body = requestBody.get();
            if (body.isMultiPart()) {
                log.info("BODY: \n{}", body.multiParts());
            } else {
                log.info("BODY: \n{}", prettyPrint(body.uniPart()));
            }
        }
    }

    @Override
    public void onResponse(HttpResponse<?> response, HttpRequestSummary request, Config config) {
        log.info("RESPONSE\nSTATUS CODE: {}\nBODY: \n{}", response.getStatus(),
                prettyPrint(response.getBody()));
    }
}
