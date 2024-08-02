package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.chart.Chart;

import java.io.File;
import java.io.IOException;
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

    public static boolean send(Config config) throws IOException, MessageBuildException {
        boolean successfulSending = true;

        final List<Notifier> notifiers = ClientFactory.from(config);
        if (notifiers.isEmpty()) {
            return successfulSending;
        }

        Base base = config.getBase();
        JSON json = new JSON();
        Summary summary = json.parseFile(new File(base.getAllureFolder(), "widgets/summary.json"), Summary.class);
        Phrases phrases = json.parseResource("/phrases/" + base.getLanguage() + ".json", Phrases.class);
        MessageData messageData = new MessageData(config.getBase(), summary, phrases);
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
