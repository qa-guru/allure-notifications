package allure.piechart.telegram.utils;

import allure.piechart.telegram.bot.AllureBot;
import allure.piechart.telegram.models.Summary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import static allure.piechart.telegram.bot.factory.BotFactory.getBot;
import static allure.piechart.telegram.utils.ConfigHelper.debug;

/**
 * Вспомогательный класс для работы с приложением.
 *
 * @author kadehar
 * @since 2.0
 */
public class Utils {
    private static final Logger LOGGER = LoggerFactory.getLogger(Utils.class);

    /** Возвращает дату на основе времени в мс */
    public static String getTimeFromMilliseconds(final @NotNull Long milliseconds) {
        LOGGER.info("Time in ms: {}", milliseconds);
        Date date = new Date(milliseconds);
        LOGGER.info("Current date: {}", date.toString());
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        LOGGER.info("Time Zone: {}", formatter.getTimeZone());

        return formatter.format(date);
    }

    /** Возвращает результаты сборки в виде модели Summary */
    public static Summary getBuildSummary(final @NotNull String path) {
        ObjectMapper objectMapper = new ObjectMapper();
        Summary summary = null;
        try {
            LOGGER.info("Parsing build results by path: {}", path);
            summary = objectMapper.readValue(new File(path), Summary.class);
            LOGGER.info("Operation is finished successfully");
        } catch (IOException e) {
            LOGGER.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
        return summary;
    }

    /** Опции командной строки для отладки при разработке */
    public static String[] debugArgs() {
        return new String[] {
                "-ch",
                String.valueOf(debug().enableChart()),
                "-s",
                debug().botSecret(),
                "-c",
                debug().chatId(),
                "-p",
                debug().projectName(),
                "-f",
                debug().allureReportFolder(),
                "-b",
                debug().buildLink(),
                "-n",
                debug().launchName(),
                "-e",
                debug().environment(),
                "-l",
                "en"
        };
    }

    /**
     * Создаёт нового бота.
     *
     * @param token секретный ключ бота
     * @param messenger мессенджер, для которого предназначен бот
     * @return бот
     */
    public static AllureBot createBot(final @NotNull String token, final @NotNull String messenger) {
        return getBot(token, messenger);
    }
}
