package guru.qa.allure.notifications.clients;

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
                    notifier.sendPhoto();
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
