package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.json.JSON;
import kong.unirest.Body;
import kong.unirest.Config;
import kong.unirest.ContentType;
import kong.unirest.Headers;
import kong.unirest.HttpRequest;
import kong.unirest.HttpRequestSummary;
import kong.unirest.HttpResponse;
import kong.unirest.Interceptor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class LogInterceptor implements Interceptor {
    private final JSON json = new JSON();

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
                json.prettyPrint(response.getBody().toString()));
    }

    private void logRequestBody(Body body, Headers headers) {
        if (body.isMultiPart()) {
            log.info("BODY: \n{}", body.multiParts());
            return;
        }
        if (headers.get("Content-Type").contains(ContentType.APPLICATION_FORM_URLENCODED.getMimeType())) {
            log.info("BODY: \n{}", body.uniPart());
            return;
        }
        log.info("BODY: \n{}", json.prettyPrint(body.uniPart().toString()));
    }
}
