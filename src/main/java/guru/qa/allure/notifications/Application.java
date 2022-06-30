package guru.qa.allure.notifications;

import guru.qa.allure.notifications.clients.Notification;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessagingException;
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
        Config config = ApplicationConfig.newInstance().readConfig();
        Unirest.config()
                .interceptor(new LogInterceptor());

        ProxyManager.manageProxy(config.proxy());

        try {
            Notification.send(config);
        }
        catch (MessagingException e) {
            LOG.error(e.getMessage(), e);
            System.exit(1);
        }
        finally {
            Unirest.shutDown();
        }

        LOG.info("Finish.");
    }
}
