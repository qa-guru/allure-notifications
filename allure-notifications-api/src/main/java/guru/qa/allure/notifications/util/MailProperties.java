package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mail.SecurityProtocol;

import java.util.Locale;
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
        properties.put("mail.smtp.port", mail.getPort());
        properties.put("mail.smtp.auth", "true");
        SecurityProtocol securityProtocol = mail.getSecurityProtocol();
        if (securityProtocol != null) {
            properties.put("mail.smtp." + securityProtocol.name().toLowerCase(Locale.ROOT) + ".enable", true);
        }
        return properties;
    }
}
