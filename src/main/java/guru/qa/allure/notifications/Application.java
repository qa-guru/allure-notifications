package guru.qa.allure.notifications;

import guru.qa.allure.notifications.clients.Notification;
import guru.qa.allure.notifications.config.helpers.Proxy;
import guru.qa.allure.notifications.journal.ApplicationJournal;
import guru.qa.allure.notifications.util.LogInterceptor;
import guru.qa.allure.notifications.util.ProxyManager;
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
        ApplicationJournal.proxyInfo();
        ApplicationJournal.skypeInfo();

        Unirest.config()
                .interceptor(new LogInterceptor());
        ProxyManager.manageProxy();
        Notification.send();
        Unirest.shutDown();
        LOG.info("Finish.");
    }
}
