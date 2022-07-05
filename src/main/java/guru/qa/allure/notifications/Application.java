package guru.qa.allure.notifications;

import guru.qa.allure.notifications.clients.Notification;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.util.LogInterceptor;
import guru.qa.allure.notifications.util.ProxyManager;
import kong.unirest.Unirest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Application {

    public static void main(String[] args) {
        startApplication();
    }

    private static void startApplication() {
        log.info("Start...");
        Config config = ApplicationConfig.newInstance().readConfig();
        Unirest.config()
                .interceptor(new LogInterceptor());

        ProxyManager.manageProxy(config.getProxy());

        try {
            Notification.send(config);
        } catch (MessagingException e) {
            log.error(e.getMessage(), e);
            System.exit(1);
        } finally {
            Unirest.shutDown();
        }

        log.info("Finish.");
    }
}
