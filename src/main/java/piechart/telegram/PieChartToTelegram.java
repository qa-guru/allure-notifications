package piechart.telegram;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class PieChartToTelegram {
    static String piechartName = "piechart";
    static String pathToDataFile = "export/prometheusData.txt";
    public static String secretBot;

    // java -jar "-12345678" "Project_name" allure-report/ http://.../job/Project_name/60/
    public static void main(String[] args) {

//        String chatId = "0";                                    // for debug
//        String projectName = "Project name";                    // for debug
//        String pathToAllureReportFolder = "allure-report/";     // for debug
//        String linkToBuild = "http://google.com/";              // for debug

        String chatId = args[0];                                // telegram chat id
        secretBot = args[0];                                    // telegram secret for bot
        String projectName = args[1];                           // name, displayed in piechart title
        String pathToAllureReportFolder = args[2];              // path to allure-report/
        String linkToBuild = args[3];                           // link to build

        String linkToAllureReport = linkToBuild + "allure";    // link to allure report
        String fullPathToDataFile = pathToAllureReportFolder + pathToDataFile;

        List<Long> testResultsData = Utils.parsedDataForPie(fullPathToDataFile);
        long successPercent = testResultsData.get(2) * 100 /
                (testResultsData.get(0) +
                testResultsData.get(1) +
                testResultsData.get(2) +
                testResultsData.get(3) +
                testResultsData.get(4));

        if (successPercent == 100) { //todo - fucked jenkins sometimes sends to telegram even if 100%
            return;
        }

        String telegramMessage = "[" + successPercent + "] " + projectName + "\n" +
                "Link to allure report: " + linkToAllureReport;

        // generate piechart
        PieChart chart = PieChartBuilder.getChart(testResultsData, projectName);
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
}
