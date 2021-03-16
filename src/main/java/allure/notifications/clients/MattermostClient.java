package allure.notifications.clients;

import allure.notifications.chart.Chart;
import allure.notifications.models.Summary;
import allure.notifications.options.OptionsValues;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;

/**
 * Клиент для отправки сообщений в Mattermost
 *
 * @author ferras777
 * @since 2.9.0
 */
public class MattermostClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(MattermostClient.class);

    /**
     * Отправка сообщения в Mattermost.
     *
     * @param values  параметры пользователя
     * @param summary результат выполнения тестов
     * @param text    сообщение
     */
    public static void sendMessageToMattermost(final @NotNull OptionsValues values, final @NotNull Summary summary,
                                               final @NotNull String text) {

        Map<String, Object> body = new HashMap<>();
        body.put("channel_id", values.getChatId());
        body.put("message", text);

        if (values.isChart()) {
            Chart.createChart(values, summary);
            List<String> chartImageId =
                    given()
                            .header("Authorization", "Bearer " + values.getToken())
                            .queryParam("channel_id", values.getChatId())
                            .queryParam("filename", "piechart")
                            .multiPart("photo", new File("piechart.png"))
                            .post("https://" + values.getMattermostUrl() + "/api/v4/files")
                            .then().extract().jsonPath().getList("file_infos.id");

            body.put("file_ids", Collections.singletonList(chartImageId.get(0)));
        }
        ValidatableResponse response =
                given()
                        .header("Authorization", "Bearer " + values.getToken())
                        .contentType(ContentType.JSON)
                        .body(body)
                        .post("https://" + values.getMattermostUrl() + "/api/v4/posts")
                        .then();
        LOGGER.info("Text sent to Mattermost {}", response.extract().asString());
    }
}