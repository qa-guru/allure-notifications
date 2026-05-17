package guru.qa.allure.notifications;

import java.io.IOException;

import guru.qa.allure.notifications.clients.Notification;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.util.LogInterceptor;
import guru.qa.allure.notifications.util.ProxyManager;
import kong.unirest.Unirest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Application {

    public static void main(String[] args) throws IOException {
        log.info("Start...");
        ApplicationConfig applicationConfig = new ApplicationConfig();
        Config config = applicationConfig.readConfig();
        String configDirectory = applicationConfig.getConfigDirectory();

        Unirest.config()
                .interceptor(new LogInterceptor());

        ProxyManager.manageProxy(config.getProxy());

        boolean successfulSending;
        try {
            successfulSending = Notification.send(config, configDirectory);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            successfulSending = false;
        } finally {
            Unirest.shutDown();
        }

        if (!successfulSending) {
            System.exit(1);
        }

        log.info("Finish.");
    }
}
