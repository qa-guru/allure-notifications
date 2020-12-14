package allure.piechart.telegram.utils;

import allure.piechart.telegram.models.Summary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import static allure.piechart.telegram.utils.ConfigHelper.debug;

public class Utils {
    private static final Logger LOGGER = LoggerFactory.getLogger(Utils.class);

    public static String getTimeFromMilliseconds(Long milliseconds) {
        LOGGER.info("Time in ms: {}", milliseconds);
        Date date = new Date(milliseconds);
        LOGGER.info("Current date: {}", date.toString());
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        LOGGER.info("Date format: {}", formatter.toString());
        LOGGER.info("Time Zone: {}", formatter.getTimeZone());

        return formatter.format(date);
    }

    public static Summary getBuildSummary(final String path) {
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
        LOGGER.info("Create photo attachment with file name {}, caption {}, chat ID {}",
                fileName, caption, chatId);
        SendPhoto photo = new SendPhoto();
        photo.setPhoto(new File(fileName + ".png"));
        photo.setCaption(caption);
        photo.setChatId(chatId);
        LOGGER.info("Operation is finished successfully");
        return photo;
    }

    public static SendMessage textMessage(final String text, final String chatId) {
        LOGGER.info("Create message with text {} and chat ID {}",
                text, chatId);
        SendMessage message = new SendMessage();
        message.setText(text);
        message.setChatId(chatId);
        LOGGER.info("Operation is finished successfully");
        return message;
    }

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
                debug().environment()
        };
    }
}
