package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.chart.Chart;
import java.util.List;

import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessagingException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Notification {

    public static boolean send(Config config) {

        boolean successfulSending = true;

        final List<Notifier> notifiers = ClientFactory.from(config);
        for (Notifier notifier : notifiers) {
            try {
                log.info("Sending message...");
                if (config.getBase().getEnableChart()) {
                    byte[] chartImage = Chart.createChart(config.getBase());
                    notifier.sendPhoto(chartImage);
                }
                else {
                    notifier.sendText();
                }
                log.info("Done.");
            } catch (MessagingException e){
                successfulSending = false;
                log.error(e.getMessage(), e);
            }
        }

        return successfulSending;
    }
}
