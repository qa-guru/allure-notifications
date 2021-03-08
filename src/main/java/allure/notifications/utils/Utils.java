package allure.notifications.utils;

import allure.notifications.bot.factory.BotFactory;
import allure.notifications.bot.AllureBot;
import allure.notifications.models.Summary;
import allure.notifications.templates.data.TemplateData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.TimeZone;
import java.util.stream.Collectors;

import static allure.notifications.utils.ConfigHelper.debug;

/**
 * Вспомогательный класс для работы с приложением.
 *
 * @author kadehar
 * @since 2.0
 */
public class Utils {
    private static final Logger LOGGER = LoggerFactory.getLogger(Utils.class);

    /** Создает единую строку из списка строк */
    public static String createStringFromListValues(final List<String> strings) {
        return strings.stream().map(Objects::toString).collect(Collectors.joining(" "));
    }

    /** Создание данных для шаблона сообщений */
    public static TemplateData getTemplateData(final @NotNull Summary summary, final @NotNull String launchName,
                                               final @NotNull String env, final @NotNull String reportLink) {
        return new TemplateData.Builder()
                .failed(summary.getStatistic().getFailed())
                .broken(summary.getStatistic().getBroken())
                .passed(summary.getStatistic().getPassed())
                .unknown(summary.getStatistic().getUnknown())
                .skipped(summary.getStatistic().getSkipped())
                .total(summary.getStatistic().getTotal())
                .duration(summary.getTime().getDuration())
                .launch(launchName)
                .environment(env)
                .reportLink(reportLink)
                .build();
    }

    /**
     * Создаёт нового бота.
     *
     * @param token секретный ключ бота
     * @param messenger мессенджер, для которого предназначен бот
     * @return бот
     */
    public static AllureBot createBot(final @NotNull String token, final @NotNull String messenger) {
        return BotFactory.getBot(token, messenger);
    }

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
                debug().language(),
                "-m",
                debug().messenger()
        };
    }
}
