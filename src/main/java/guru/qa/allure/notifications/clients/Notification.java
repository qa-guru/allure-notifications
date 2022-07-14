package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessagingException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Notification {

    public static void send(Config config) throws MessagingException {
        final Notifier notifier = ClientFactory.from(config);
        log.info("Sending message...");
        if (config.getBase().getEnableChart()) {
            byte[] chartImage = Chart.createChart(config.getBase());
            notifier.sendPhoto(chartImage);
        } else {
            notifier.sendText();
        }
        log.info("Done.");
    }

}
