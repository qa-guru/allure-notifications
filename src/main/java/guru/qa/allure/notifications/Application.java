package guru.qa.allure.notifications;

import guru.qa.allure.notifications.clients.Notification;
import guru.qa.allure.notifications.journal.ApplicationJournal;
import guru.qa.allure.notifications.util.LogInterceptor;
import kong.unirest.Unirest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Application {
    private static final Logger LOG = LoggerFactory.getLogger("APP");

    public static void main(String[] args) {
        startApplication();
    }

    private static void startApplication() {
        LOG.info("Start...");
        ApplicationJournal.buildInfo();
        ApplicationJournal.botInfo();
        ApplicationJournal.baseInfo();
        ApplicationJournal.mailInfo();

        Unirest.config()
                .interceptor(new LogInterceptor());
        Notification.send();
        Unirest.shutDown();
        LOG.info("Finish.");
    }
}
