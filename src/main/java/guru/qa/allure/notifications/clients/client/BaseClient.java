package guru.qa.allure.notifications.clients.client;

import kong.unirest.Unirest;

import java.util.Map;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for requests sending.
 */
public class BaseClient {

    public void post(String  url, Map<String, Object> routes,
                     Map<String, String> headers, Object body) {
        Unirest.post(url)
                .routeParam(routes)
                .headers(headers)
                .body(body)
                .asString()
                .getBody();
    }

    public void post(String url, Map<String, Object> routes,
                     Map<String, String> headers, Map<String, Object> fields) {
        Unirest.post(url)
                .routeParam(routes)
                .headers(headers)
                .fields(fields)
                .asString()
                .getBody();
    }

    public void post(String  url, Map<String, String> headers, Object body) {
        Unirest.post(url)
                .headers(headers)
                .body(body)
                .asString()
                .getBody();
    }

    public void post(String url, Map<String, String> headers,
                     Map<String, Object> fields) {
        Unirest.post(url)
                .headers(headers)
                .fields(fields)
                .asString()
                .getBody();
    }
}
