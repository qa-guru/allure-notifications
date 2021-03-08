package allure.notifications.clients;

import allure.notifications.chart.Chart;
import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import io.restassured.response.ValidatableResponse;
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
     * @param values параметры пользователя
     * @param summary результат выполнения тестов
     * @param text сообщение
     */
    public static void sendMessageToTelegram(final @NotNull OptionsValues values, final @NotNull Summary summary,
                                             final @NotNull String text) {
        if (values.isChart()) {
            Chart.createChart(values, summary);

            ValidatableResponse response =
                    given()
                            .multiPart("photo", new File("piechart.png"))
                            .formParam("chat_id", values.getChatId())
                            .formParam("caption", text)
                            .formParam("parse_mode", "Markdown")
                            .post("https://api.telegram.org/bot" + values.getToken() + "/sendPhoto")
                            .then();
        } else {
            ValidatableResponse response =
                    given()
                            .formParam("chat_id", values.getChatId())
                            .formParam("text", text)
                            .formParam("parse_mode", "Markdown")
                            .post("https://api.telegram.org/bot" + values.getToken() + "/sendMessage")
                            .then();
        }
    }
}
