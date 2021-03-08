package allure.notifications.clients;

import allure.notifications.chart.Chart;
import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import io.restassured.response.ValidatableResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;

import static allure.notifications.chart.Chart.PIECHART_FILE_NAME;
import static io.restassured.RestAssured.given;

/**
 * Клиент для отправки сообщений в slack
 *
 * @author svasenkov
 * @since 2.0.7
 */
public class SlackClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(SlackClient.class);

    /**
     * Отправка сообщения в telegram.
     *
     * @param values параметры пользователя
     * @param summary результат выполнения тестов
     * @param text сообщение
     */

    // todo: move slack commands to SlackBot
    public static void sendMessageToSlack(final @NotNull OptionsValues values, final @NotNull Summary summary,
                                             final @NotNull String text) {
        if (values.isChart()) {
            Chart.createChart(values, summary);

            ValidatableResponse response =
            given()
                    .header("Authorization", "Bearer " + values.getToken())
                    .formParam("channels", values.getChatId())
                    .formParam("filename", " ")
                    .multiPart("file", new File(PIECHART_FILE_NAME + ".png"))
                    .post("https://slack.com/api/files.upload")
                    .then();
            LOGGER.info("Picture sent to slack {}", response.extract().asString());
        }
        ValidatableResponse response =
                given()
                        .header("Authorization", "Bearer " + values.getToken())
                        .contentType("application/x-www-form-urlencoded;charset=utf-8")
                        .formParam("channel", values.getChatId())
                        .formParam("text", text)
                        .post("https://slack.com/api/chat.postMessage")
                        .then();
        LOGGER.info("Text sent to slack {}", response.extract().asString());
    }
}