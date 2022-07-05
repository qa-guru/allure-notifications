package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.mail.Mail;

import java.util.Properties;

public class MailProperties {
    private final Mail mail;

    public MailProperties(Mail mail) {
        this.mail = mail;
    }

    public Properties create() {
        Properties properties = new Properties();
        properties.put("mail.smtp.from", mail.getFrom());
        properties.put("mail.smtp.host", mail.getHost());
        properties.put("mail.smtp.ssl.enable", mail.getEnableSSL());
        properties.put("mail.smtp.port", mail.getPort());
        properties.put("mail.smtp.auth", "true");
        return properties;
    }
}
