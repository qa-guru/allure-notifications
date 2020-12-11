package allure.piechart.telegram.options;

import allure.piechart.telegram.bot.PieChartBot;
import allure.piechart.telegram.bot.TextBot;
import allure.piechart.telegram.chart.PieChartBuilder;
import allure.piechart.telegram.models.Summary;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.kohsuke.args4j.Option;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import static allure.piechart.telegram.bot.factory.BotFactory.createPieChartBot;
import static allure.piechart.telegram.bot.factory.BotFactory.createTextBot;
import static allure.piechart.telegram.utils.Utils.*;

public class CmdOptions {
    private final Logger logger = Logger.getLogger(CmdOptions.class.getName());

    @Option(name = "-ch", aliases = "--chart", usage = "Enable/disable PieChart diagram")
    public boolean chart;

    @Option(name = "-s", aliases = {"--secret", "--token"}, usage = "Set telegram bot secret token", required = true)
    public String token;

    @Option(name = "-c", aliases = {"--chat", "--id"}, usage = "Set telegram chat id", required = true)
    public String chatID;

    @Option(name = "-p", aliases = "--project", usage = "Set project name", required = true)
    public String projectName;

    @Option(name = "-f", aliases = {"--folder", "--allure"}, usage = "Set allure report folder", required = true)
    public String allureReportFolder;

    @Option(name = "-b", aliases = {"--build", "--link"}, usage = "Set link to build", required = true)
    public String buildLink;

    @Option(name = "-n", aliases = "--name", usage = "Set launch name", required = true)
    public String launchName;

    @Option(name = "-e", aliases = "--env", usage = "Set environment", required = true)
    public String env;

    public void run() {
        journal();
        final String pathToResults = allureReportFolder + "widgets/summary.json";
        logger.log(Level.INFO, "Path to build results: {0}", pathToResults);
        final Summary summary = getBuildSummary(pathToResults);
        final String reportLink = buildLink + "allure";
        logger.log(Level.INFO, "Report link: {0}", reportLink);
        final String text = telegramMessage(summary, launchName,
                env,reportLink);
        logger.log(Level.INFO, "Text: {0}", text);

        sendInfo(summary, text);
    }

    private void sendInfo(Summary summary, String text) {
        if (chart) {
            logger.info("Building chart");
            final String pieChartName = "piechart";
            PieChart chart = PieChartBuilder.getChart(summary, projectName);
            logger.log(Level.INFO, "Chart with title {0} is built", projectName);
            try {
                logger.info("Saving chart as picture");
                BitmapEncoder.saveBitmap(chart, pieChartName, BitmapEncoder.BitmapFormat.PNG);
                logger.info("Picture was saved successfully");
            } catch (IOException e) {
                logger.log(Level.INFO, e.getMessage(), e.getStackTrace());
                e.printStackTrace();
            }
            logger.info("Char is built successfully");
            PieChartBot pieChartBot = createPieChartBot(token);
            pieChartBot.sendPhotoToChat(picture(pieChartName, text, chatID));
        } else {
            TextBot textBot = createTextBot(token);
            textBot.sendTextMessage(textMessage(text, chatID));
        }
    }

    private void journal() {
        logger.log(Level.INFO, "Enable PieChart? {0}", chart);
        logger.log(Level.INFO, "Token: {0}", token);
        logger.log(Level.INFO, "Chat ID: {0}", chatID);
        logger.log(Level.INFO, "Project name: {0}", projectName);
        logger.log(Level.INFO, "Allure report folder: {0}", allureReportFolder);
        logger.log(Level.INFO, "Build link: {0}", buildLink);
        logger.log(Level.INFO, "Launch name: {0}", launchName);
        logger.log(Level.INFO, "Environment: {0}", env);
    }
}
