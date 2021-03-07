package allure.piechart.telegram.bot;

import io.restassured.response.ValidatableResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import javax.validation.constraints.NotNull;
import java.io.File;

import static allure.piechart.telegram.chart.Chart.PIECHART_FILE_NAME;
import static io.restassured.RestAssured.given;

/**
 * Отвечает за работу с telegram ботами.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TelegramBot implements AllureBot {
    private final Logger logger = LoggerFactory.getLogger(TelegramBot.class);

    private final String token;

    public TelegramBot(final String token) {
        this.token = token;
    }


    /** Отправка сообщения с фото */
    public void sendPhotoToChat(final @NotNull String photo) {
        try {
            logger.info("Sending photo to chat");

            ValidatableResponse response =
                    given()
                            .header("Authorization", "Bearer " + values.getToken())
                            .formParam("chat_id", values.getChatId())
                            .formParam("initial_comment", text)
                            .multiPart("file", new File(PIECHART_FILE_NAME + ".png"))
                            .post("https://api.telegram.org/bot" + token + "/sendMessage")
                            .then();

            LOGGER.info("resp " + response.extract().asString());
            execute(photo);
            logger.info("finished");
        } catch (TelegramApiException e) {
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }

    /** Отправка текстового сообщения */
    public void sendTextMessage(final @NotNull SendMessage message) {
        try {
            logger.info("Sending message to chat");
            execute(message);
            logger.info("finished");
        } catch (TelegramApiException e) {
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
