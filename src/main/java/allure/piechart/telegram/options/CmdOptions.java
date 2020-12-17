package allure.piechart.telegram.options;

import allure.piechart.telegram.bot.PieChartBot;
import allure.piechart.telegram.bot.TextBot;
import allure.piechart.telegram.chart.PieChartBuilder;
import allure.piechart.telegram.models.Summary;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.PieChart;
import org.kohsuke.args4j.Option;
import org.kohsuke.args4j.spi.ExplicitBooleanOptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import static allure.piechart.telegram.bot.factory.BotFactory.createPieChartBot;
import static allure.piechart.telegram.bot.factory.BotFactory.createTextBot;
import static allure.piechart.telegram.utils.Utils.*;

public class CmdOptions {
    private final Logger logger = LoggerFactory.getLogger(CmdOptions.class);

    @Option(name = "-ch", aliases = "--chart", usage = "Enable/disable PieChart diagram", handler = ExplicitBooleanOptionHandler.class)
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
        logger.info("Path to build results: {}", pathToResults);
        final Summary summary = getBuildSummary(pathToResults);
        final String reportLink = buildLink + "allure";
        logger.info("Report link: {}", reportLink);
        final String text = telegramMessage(summary, launchName,
                env,reportLink);
        logger.info("Text: {}", text);

        sendInfo(summary, text);
    }

    private void sendInfo(Summary summary, String text) {
        if (chart) {
            logger.info("Building chart");
            final String pieChartName = "piechart";
            PieChart chart = PieChartBuilder.getChart(summary, projectName);
            logger.info("Chart with title {} is built", projectName);
            try {
                logger.info("Saving chart as picture");
                BitmapEncoder.saveBitmap(chart, pieChartName, BitmapEncoder.BitmapFormat.PNG);
                logger.info("Picture was saved successfully");
            } catch (IOException e) {
                logger.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
                e.printStackTrace();
                System.exit(1);
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
        logger.info("Enable PieChart? {}", chart);
        logger.info("Token: {}", token);
        logger.info("Chat ID: {}", chatID);
        logger.info("Project name: {}", projectName);
        logger.info("Allure report folder: {}", allureReportFolder);
        logger.info("Build link: {}", buildLink);
        logger.info("Launch name: {}", launchName);
        logger.info("Environment: {}", env);
    }
}
