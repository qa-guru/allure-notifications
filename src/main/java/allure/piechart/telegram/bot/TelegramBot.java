package allure.piechart.telegram.bot;

import allure.piechart.telegram.options.OptionsValues;
import io.restassured.response.ValidatableResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;

import static io.restassured.RestAssured.given;

/**
 * Отвечает за работу с telegram ботами.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TelegramBot implements AllureBot {
    private final Logger logger = LoggerFactory.getLogger(TelegramBot.class);

    /** Отправка сообщения с фото */
    public void sendPhotoToChat(final @NotNull String message, final @NotNull OptionsValues values) {
        try {
            logger.info("Sending photo to chat");
            ValidatableResponse response =
                    given()
                            .formParam("chat_id", values.getChatId())
                            .formParam("initial_comment", message)
                            .multiPart("file", new File("piechart.png"))
                            .post("https://api.telegram.org/bot" + values.getToken() + "/sendMessage")
                            .then();

            logger.info("finished");
//        } catch (TelegramApiException e) {
        } catch (Exception e) {
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }

    /** Отправка текстового сообщения */
    public void sendTextMessage(final @NotNull String message, final @NotNull OptionsValues values) {
        try {
            logger.info("Sending message to chat");
//            execute(message); todo
            logger.info("finished");
//        } catch (TelegramApiException e) {
        } catch (Exception e) {
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
