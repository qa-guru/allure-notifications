package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.config.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Notification {
    private static final Logger LOG =
            LoggerFactory.getLogger(Notification.class);

    public static void send(Config config) {
        final Notifier notifier = ClientFactory.from(config);
        LOG.info("Sending message...");
        if (config.base().enableChart()) {
            notifier.sendPhoto();
        } else {
            notifier.sendText();
        }
        LOG.info("Done.");
    }
}
