package allure.piechart.telegram.bot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

/**
 * Отвечает за отправку PieChart диаграммы с результатами в чат.
 *
 * @author Кузнецов Алексей
 * @since 09.12.2020
 */
public class PieChartBot extends TelegramLongPollingBot {
    private final Logger logger = LoggerFactory.getLogger(PieChartBot.class);

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
            logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
