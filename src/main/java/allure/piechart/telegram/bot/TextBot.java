package allure.piechart.telegram.bot;

import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Отвечает за отправку текстового сообщения с результатами в чат.
 *
 * @author Кузнецов Алексей
 * @since 09.12.2020
 */
public class TextBot extends TelegramLongPollingBot {
    private final Logger logger = Logger.getLogger(TextBot.class.getName());

    private final String token;

    public TextBot(final String token) {
        this.token = token;
    }

    @Override
    public void onUpdateReceived(Update update) {

    }

    @Override
    public String getBotUsername() {
        return null;
    }

    @Override
    public String getBotToken() {
        return token;
    }

    /** Отправка текстового сообщения */
    public void sendTextMessage(SendMessage message) {
        try {
            logger.info("Sending message to chat");
            execute(message);
            logger.info("finished");
        } catch (TelegramApiException e) {
            logger.log(Level.INFO, e.getMessage(), e.getStackTrace());
            e.printStackTrace();
        }
    }
}
