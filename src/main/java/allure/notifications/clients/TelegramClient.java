package allure.notifications.clients;

import allure.notifications.chart.Chart;
import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import io.restassured.specification.ProxySpecification;
import io.restassured.specification.RequestSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;

import static io.restassured.RestAssured.given;

/**
 * Клиент для отправки сообщений в telegram
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TelegramClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(TelegramClient.class);

    /**
     * Отправка сообщения в telegram.
     *
     * @param values  параметры пользователя
     * @param summary результат выполнения тестов
     * @param text    сообщение
     */
    public static void sendMessageToTelegram(final @NotNull OptionsValues values, final @NotNull Summary summary,
                                             final @NotNull String text) {
        LOGGER.debug("text " + text);
        if (values.isChart()) {
            Chart.createChart(values, summary);

            ValidatableResponse response =
                    given().spec(requestSpec(values))
                            .multiPart("photo", new File("piechart.png"))
                            .formParam("caption", text)
                            .post("https://api.telegram.org/bot" + values.getToken() + "/sendPhoto")
                            .then();
        } else {
            ValidatableResponse response =
                    given().spec(requestSpec(values))
                            .formParam("text", text)
                            .post("https://api.telegram.org/bot" + values.getToken() + "/sendMessage")
                            .then();
        }
    }

    private static RequestSpecification requestSpec(final @NotNull OptionsValues values) {
        RequestSpecBuilder requestSpecBuilder = new RequestSpecBuilder();

        requestSpecBuilder
                .addFormParam("chat_id", values.getChatId())
                .addFormParam("parse_mode", "Markdown");

        if (!values.getProxyHost().equals("") && values.getProxyPort() != 0) {
            requestSpecBuilder.setProxy(ProxySpecification
                    .host(values.getProxyHost())
                    .withPort(values.getProxyPort()));

            if (!values.getProxyLogin().equals("") && !values.getProxyPassword().equals("")) {
                return requestSpecBuilder.build();
            }
            requestSpecBuilder.setProxy(ProxySpecification
                    .host(values.getProxyHost())
                    .withPort(values.getProxyPort())
                    .withAuth(values.getProxyLogin(), values.getProxyPassword()));
        }

        return requestSpecBuilder.build();
    }
}
