package allure.piechart.telegram.utils;

import allure.piechart.telegram.models.Summary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;

import static allure.piechart.telegram.utils.Debug.*;

public class Utils {
    private static final Logger LOGGER = Logger.getLogger(Utils.class.getName());

    public static String getTimeFromMilliseconds(Long milliseconds) {
        LOGGER.log(Level.INFO, "Time in ms: {0}", milliseconds);
        Date date = new Date(milliseconds);
        LOGGER.log(Level.INFO, "Current date: {0}", date.toString());
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        LOGGER.log(Level.INFO, "Date format: {0}", formatter.toString());
        LOGGER.log(Level.INFO, "Time Zone: {0}", formatter.getTimeZone());

        return formatter.format(date);
    }

    public static Summary getBuildSummary(final String path) {
        ObjectMapper objectMapper = new ObjectMapper();
        Summary summary = null;
        try {
            LOGGER.log(Level.INFO, "Parsing build results by path: {0}", path);
            summary = objectMapper.readValue(new File(path), Summary.class);
            LOGGER.info("Operation is finished successfully");
        } catch (IOException e) {
            LOGGER.log(Level.INFO, e.getMessage(), e.getStackTrace());
            e.printStackTrace();
        }
        return summary;
    }

    public static String telegramMessage(final Summary summary, final String launchName,
                                         final String env, final String reportLink) {
        long failedResult = summary.getStatistic().getFailed();
        long brokenResult = summary.getStatistic().getBroken();
        long passedResult = summary.getStatistic().getPassed();
        long unknownResult = summary.getStatistic().getUnknown();
        long totalResult = summary.getStatistic().getTotal();
        long failedPercent = failedResult * 100 / totalResult;
        long passedPercent = passedResult * 100 / totalResult;

        return "Результаты: " + launchName + "\n" +
                "- продолжительность: "  + getTimeFromMilliseconds(summary.getTime().getDuration()) + "\n" +
                "- всего сценариев в запуске: " + totalResult + "\n" +
                "- рабочий стенд: " + env + "\n" +
                "- из них успешных: " + passedResult + "\n" +
                "- из них упавших: " + failedResult + "\n" +
                (brokenResult > 0 ? "- из них сломано: " + brokenResult + "\n" : "") +
                (unknownResult > 0 ? "- из них упавших по неизвестной причине: " + unknownResult + "\n" : "") +
                "- из них пропущенных: " + summary.getStatistic().getSkipped() + "\n" +
                "- % упавших тестов: " + failedPercent + "\n" +
                "- % прошедших тестов: " + passedPercent + "\n" +
                reportLink;
    }

    public static SendPhoto picture(final String fileName, final String caption, final String chatId) {
        LOGGER.log(Level.INFO, "Create photo attachment with file name {0}, caption {1}, chat ID {2}",
                new Object[] {fileName, caption, chatId});
        SendPhoto photo = new SendPhoto();
        photo.setPhoto(new File(fileName + ".png"));
        photo.setCaption(caption);
        photo.setChatId(chatId);
        LOGGER.info("Operation is finished successfully");
        return photo;
    }

    public static SendMessage textMessage(final String text, final String chatId) {
        LOGGER.log(Level.INFO, "Create message with text {0} and chat ID {1}",
                new Object[] {text, chatId});
        SendMessage message = new SendMessage();
        message.setText(text);
        message.setChatId(chatId);
        LOGGER.info("Operation is finished successfully");
        return message;
    }

    public static String[] debugArgs() {
        return new String[] {
                "-ch",
                String.valueOf(ENABLE_CHART),
                "-s",
                BOT_SECRET,
                "-c",
                CHAT_ID,
                "-p",
                PROJECT_NAME,
                "-f",
                ALLURE_REPORT_FOLDER,
                "-b",
                BUILD_LINK,
                "-n",
                LAUNCH_NAME,
                "-e",
                ENV
        };
    }
}
