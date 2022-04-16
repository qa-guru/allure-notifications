package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.base.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Notification {
    private static final Logger LOG =
            LoggerFactory.getLogger(Notification.class);
    private static final Base base = ApplicationConfig.newInstance()
            .readConfig().base();

    public static void send() {
        final Notifier notifier = ClientFactory
                .from(base.messenger());
        LOG.info("Sending message...");
        if (base.enableChart()) {
            notifier.sendPhoto();
        } else {
            notifier.sendText();
        }
        LOG.info("Done.");
    }
}
