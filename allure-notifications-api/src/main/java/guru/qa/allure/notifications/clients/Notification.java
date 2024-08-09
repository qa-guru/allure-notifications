package guru.qa.allure.notifications.clients;

import static java.lang.Boolean.TRUE;

import guru.qa.allure.notifications.chart.Chart;

import java.io.File;
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
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Notification {
    private static final String SUITES_DATA_PATH = "widgets/suites.json";

    public static boolean send(Config config) throws IOException, MessageBuildException {
        boolean successfulSending = true;

        final List<Notifier> notifiers = ClientFactory.from(config);
        if (notifiers.isEmpty()) {
            return successfulSending;
        }

        Base base = config.getBase();
        JSON json = new JSON();
        String allureFolderPath = base.getAllureFolder();
        Summary summary = json.parseFile(new File(allureFolderPath, "widgets/summary.json"), Summary.class);
        String suitesSummaryJson = null;
        Path path = Paths.get(allureFolderPath, SUITES_DATA_PATH);
        if (TRUE.equals(base.getEnableSuitesPublishing())) {
            if (Files.exists(path)) {
                suitesSummaryJson = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
            } else {
                log.warn("Suites statistic publishing is enabled, but JSON file with data cannot be found! "
                        + "Check \"{}\" file in Allure folder.", SUITES_DATA_PATH);
            }
        }
        Phrases phrases = json.parseResource("/phrases/" + base.getLanguage() + ".json", Phrases.class);
        MessageData messageData = new MessageData(config.getBase(), summary, suitesSummaryJson, phrases);
        byte[] chartImage = null;
        if (base.getEnableChart()) {
            Legend legend = json.parseResource("/legend/" + base.getLanguage() + ".json", Legend.class);
            chartImage = Chart.createChart(base, summary, legend);
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
