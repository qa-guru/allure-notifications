package guru.qa.allure.notifications.clients;

import static java.lang.Boolean.TRUE;

import guru.qa.allure.notifications.chart.Chart;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.report.LocatedReport;
import guru.qa.allure.notifications.report.ReportLocator;
import guru.qa.allure.notifications.report.SummaryReader;
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Notification {

    public static boolean send(Config config) throws IOException, MessageBuildException {
        return send(config, null);
    }

    public static boolean send(Config config, String chartOutputDir) throws IOException, MessageBuildException {
        boolean successfulSending = true;

        final List<Notifier> notifiers = ClientFactory.from(config);
        if (notifiers.isEmpty()) {
            return successfulSending;
        }

        Base base = config.getBase();
        JSON json = new JSON();
        String allureFolderPath = base.getAllureFolder();
        LocatedReport located = ReportLocator.locate(Paths.get(allureFolderPath));
        Summary summary = SummaryReader.read(json, located);
        String suitesSummaryJson = null;
        if (TRUE.equals(base.getEnableSuitesPublishing())) {
            if (located.getSuitesPath().isPresent()) {
                Path suitesPath = located.getSuitesPath().get();
                suitesSummaryJson = new String(Files.readAllBytes(suitesPath), StandardCharsets.UTF_8);
            } else {
                log.warn("Suites statistic publishing is enabled, but JSON file with data cannot be found! "
                        + "Check \"widgets/suites.json\" in Allure folder.");
            }
        }
        Phrases phrases = json.parseResource("/phrases/" + base.getLanguage() + ".json", Phrases.class);
        MessageData messageData = new MessageData(config.getBase(), summary, suitesSummaryJson, phrases);
        byte[] chartImage = null;
        if (base.getEnableChart()) {
            Legend legend = json.parseResource("/legend/" + base.getLanguage() + ".json", Legend.class);
            chartImage = Chart.createChart(base, summary, legend);
            if (chartOutputDir != null) {
                Path chartPath = Paths.get(chartOutputDir, "chart.png");
                Files.write(chartPath, chartImage);
                log.info("Chart saved to {}", chartPath.toAbsolutePath());
            }
        }

        for (Notifier notifier : notifiers) {
            try {
                log.info("Sending message...");
                if (base.getEnableChart()) {
                    notifier.sendPhoto(messageData, chartImage);
                } else {
                    notifier.sendText(messageData);
                }
                log.info("Done.");
            } catch (MessagingException e) {
                successfulSending = false;
                log.error(e.getMessage(), e);
            }
        }

        return successfulSending;
    }
}
