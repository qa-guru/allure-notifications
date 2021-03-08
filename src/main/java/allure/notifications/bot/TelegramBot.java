package allure.notifications.bot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import javax.validation.constraints.NotNull;

/**
 * Отвечает за работу с telegram ботами.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TelegramBot extends TelegramLongPollingBot implements AllureBot {
    private final Logger logger = LoggerFactory.getLogger(TelegramBot.class);

    private final String token;

    public TelegramBot(final String token) {
        this.token = token;
    }

    @Override
    public String getBotUsername() {
        return null;
    }

    @Override
    public String getBotToken() {
        return token;
    }

    @Override
    public void onUpdateReceived(Update update) {

    }

    /** Отправка сообщения с фото */
    public void sendPhotoToChat(final @NotNull SendPhoto photo) {
        try {
            logger.info("Sending photo to chat");
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
