package allure.piechart.telegram.clients;

import allure.piechart.telegram.bot.AllureBot;
import allure.piechart.telegram.chart.PieChartBuilder;
import allure.piechart.telegram.models.Summary;
import allure.piechart.telegram.options.OptionsValues;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.methods.ParseMode;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import javax.validation.constraints.NotNull;
import java.io.IOException;

import static allure.piechart.telegram.attachments.Attachment.photo;
import static allure.piechart.telegram.attachments.Attachment.textMessage;
import static allure.piechart.telegram.utils.Utils.createBot;

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
        AllureBot bot = createBot(values.getToken(), "telegram");
        if (values.isChart()) {
            LOGGER.info("Create chart");
            final String pieChartName = "piechart";
            PieChart chart = PieChartBuilder.getChart(summary, values.getProjectName());
            LOGGER.info("Chart title: {}", chart.getTitle());
            try {
                LOGGER.info("Try to save chart as a picture {}.png", pieChartName);
                BitmapEncoder.saveBitmap(chart, pieChartName, BitmapEncoder.BitmapFormat.PNG);
                LOGGER.info("Picture is saved successfully");
            } catch (IOException e) {
                LOGGER.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
                e.printStackTrace();
                System.exit(1);
            }
            LOGGER.info("Chart is created successfully");
            SendPhoto photo = photo(pieChartName, text, values.getChatId())
                    .setParseMode(ParseMode.HTML);
            bot.sendPhotoToChat(photo);
        } else {
            SendMessage message = textMessage(text, values.getChatId()).enableHtml(true);
            bot.sendTextMessage(message);
        }
    }
}
