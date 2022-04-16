package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.mail.Mail;

import java.util.Properties;

public class MailProperties {
    private final Mail mail = ApplicationConfig.newInstance()
            .readConfig().mail();

    public Properties create() {
        Properties properties = new Properties();
        properties.put("mail.smtp.from", mail.from());
        properties.put("mail.smtp.host", mail.host());
        properties.put("mail.smtp.ssl.enable", mail.enableSSL());
        properties.put("mail.smtp.port", mail.port());
        properties.put("mail.smtp.auth", "true");
        return properties;
    }
}
