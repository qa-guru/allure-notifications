package allure.piechart.telegram.clients;

import allure.piechart.telegram.chart.Chart;
import allure.piechart.telegram.chart.ChartBuilder;
import allure.piechart.telegram.models.Summary;
import allure.piechart.telegram.options.OptionsValues;
import io.restassured.response.ValidatableResponse;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;

import static allure.piechart.telegram.chart.Chart.PIECHART_FILE_NAME;
import static io.restassured.RestAssured.given;
import static java.lang.String.format;

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
        String command;
        if (values.isChart()) {
            Chart.createChart(values, summary);

            ValidatableResponse response =
            given()
                    .header("Authorization", "Bearer " + values.getToken())
                    .formParam("channels", values.getChatId())
                    .formParam("initial_comment", text)
                    .multiPart("file", new File(PIECHART_FILE_NAME + ".png"))
                    .post("https://slack.com/api/files.upload")
                    .then();

            LOGGER.info("resp " + response.extract().asString());
            command = "curl " +
                            "-F \\\"file=@%s.png\\\" " +
                            "-F \\\"initial_comment=%s\\\" " +
                            "-F \\\"channels=%s\\\" " +
                            "-H \\\"Authorization: Bearer %s\\\" " +
                            "https://slack.com/api/files.upload";
        } else {
            command = "curl " +
                            "-F \\\"text=%s\\\" " +
                            "-F \\\"channels=%s\\\" " +
                            "-H \\\"Authorization: Bearer %s\\\" " +
                            "https://slack.com/api/files.upload";
        }

        LOGGER.info("Try to execute command {}", command);
    }
}