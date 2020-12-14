package allure.piechart.telegram.bot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

/**
 * Отвечает за отправку текстового сообщения с результатами в чат.
 *
 * @author Кузнецов Алексей
 * @since 09.12.2020
 */
public class TextBot extends TelegramLongPollingBot {
    private final Logger logger = LoggerFactory.getLogger(TextBot.class);

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
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
