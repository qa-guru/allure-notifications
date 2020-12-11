package allure.piechart.telegram;

import allure.piechart.telegram.models.Summary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class PieChartToTelegram {
    static String piechartName = "piechart";
    static String resultsFilePath = "widgets/summary.json";
    public static String secretBot;

    // java -jar allure-piechart-telegram.jar "chat_secret" "bot_secret" "${JOB_BASE_NAME}" "allure-report/" ${BUILD_URL} "Some regress e2e run" ${ENVIRONMENT}
    public static void main(String[] args) throws IOException {

//        String chatId = "0";                                    // for debug
//        secretBot = "0";                                        // telegram secret for bot
//        String projectName = "Project name";                    // for debug
//        String allureReportFolder = "allure-report/";     // for debug
//        String buildLink = "http://google.com/";              // for debug
//        String launchName = "123";                           // for debug
//        String someUrl = "1234";                           // for debug

        String chatId = args[0];                                // telegram chat id
        secretBot = args[1];                                    // telegram secret for bot
        String projectName = args[2];                           // name, displayed in piechart title
        String allureReportFolder = args[3];                    // path to allure-report/
        String buildLink = args[4];                             // link to build
        String launchName = args[5];                            // launch name
        String someUrl = args[6];                               // link to some url

        String linkToAllureReport = buildLink + "allure";    // link to allure report
        String fullResultsFilePath = allureReportFolder + resultsFilePath;

        ObjectMapper objectMapper = new ObjectMapper();
        Summary summaryResults = objectMapper.readValue(new File(fullResultsFilePath), Summary.class);

        long failedResult = summaryResults.getStatistic().getFailed();
        long brokenResult = summaryResults.getStatistic().getBroken();
        long passedResult = summaryResults.getStatistic().getPassed();
        long skippedResult = summaryResults.getStatistic().getSkipped();
        long unknownResult = summaryResults.getStatistic().getUnknown();
        long totalResult = summaryResults.getStatistic().getTotal();
        long failedPercent = failedResult * 100 / totalResult;
        long passedPercent = passedResult * 100 / totalResult;
        long buildDurationMilliseconds = summaryResults.getTime().getDuration();
        String buildDurationTime = getTimeFromMilliseconds(buildDurationMilliseconds);

        String telegramMessage = "Результаты: " + launchName + "\n" +
                "- продолжительность: "  + buildDurationTime + "\n" +
                "- всего сценариев в запуске: " + totalResult + "\n" +
                "- рабочий стенд: " + someUrl + "\n" +
                "- из них успешных: " + passedResult + "\n" +
                "- из них упавших: " + failedResult + "\n" +
                (brokenResult > 0 ? "- из них сломано: " + brokenResult + "\n" : "") +
                (unknownResult > 0 ? "- из них упавших по неизвестной причине: " + unknownResult + "\n" : "") +
                "- из них пропущенных: " + skippedResult + "\n" +
                "- % упавших тестов: " + failedPercent + "\n" +
                linkToAllureReport;

        // generate piechart
        PieChart chart = PieChartBuilder.getChart(summaryResults, projectName);
        try {
            BitmapEncoder.saveBitmap(chart, piechartName, BitmapEncoder.BitmapFormat.PNG);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // send piechart to telegram
        TelegramBot myBot = new TelegramBot();
        SendPhoto sendPhoto = new SendPhoto();
        sendPhoto.setPhoto(new File(piechartName + ".png"));
        sendPhoto.setCaption(telegramMessage);
        sendPhoto.setChatId(chatId);

        myBot.sendPicture(sendPhoto);
    }

    public static String getTimeFromMilliseconds(Long milliseconds) {
        Date date = new Date(milliseconds);
        DateFormat formatter = new SimpleDateFormat("HH:mm:ss.SSS");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));

        return formatter.format(date);
    }
}
