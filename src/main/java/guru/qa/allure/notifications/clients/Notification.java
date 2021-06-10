package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.config.helpers.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static guru.qa.allure.notifications.clients.Messenger.valueOf;

public class Notification {
    private static final Logger LOG = LoggerFactory.getLogger("Notification");

    public static void send() {
        final Notifier notifier = ClientFactory
                .initClientFor(valueOf(Base.messenger()));
        LOG.info("Sending message...");
        notifier.sendText();
        LOG.info("Done.");
    }
}
