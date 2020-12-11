package allure.piechart.telegram.bot;

import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Отвечает за отправку PieChart диаграммы с результатами в чат.
 *
 * @author Кузнецов Алексей
 * @since 09.12.2020
 */
public class PieChartBot extends TelegramLongPollingBot {
    private final Logger logger = Logger.getLogger(PieChartBot.class.getName());

    private final String token;

    public PieChartBot(final String token) {
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
    public void sendPhotoToChat(SendPhoto photo) {
        try {
            logger.info("Sending photo to chat");
            execute(photo);
            logger.info("finished");
        } catch (TelegramApiException e) {
            logger.log(Level.INFO, e.getMessage(), e.getStackTrace());
            e.printStackTrace();
        }
    }
}
