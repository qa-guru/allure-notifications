package guru.qa.allure.notifications.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Properties;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mail.SecurityProtocol;

class MailPropertiesTests {

    private static final String FROM = "from@gmail.com";
    private static final String HOST = "smtp.gmail.com";
    private static final String PORT = "465";

    @Test
    void shouldCreateMailPropertiesWithoutSecurityProtocolSpecified() {

        Mail mail = new Mail();
        mail.setFrom(FROM);
        mail.setHost(HOST);
        mail.setPort(PORT);

        Properties expectedProperties = new Properties();
        expectedProperties.put("mail.smtp.from", mail.getFrom());
        expectedProperties.put("mail.smtp.host", mail.getHost());
        expectedProperties.put("mail.smtp.port", mail.getPort());
        expectedProperties.put("mail.smtp.auth", "true");

        assertEquals(expectedProperties, new MailProperties(mail).create());
    }

    @ParameterizedTest
    @CsvSource({
            "SSL,      ssl",
            "STARTTLS, starttls"
    })
    void shouldCreateMailPropertiesWithSecurityProtocolSpecified(SecurityProtocol securityProtocol,
            String propertyNamePart) {

        Mail mail = new Mail();
        mail.setFrom(FROM);
        mail.setHost(HOST);
        mail.setPort(PORT);
        mail.setSecurityProtocol(securityProtocol);

        Properties expectedProperties = new Properties();
        expectedProperties.put("mail.smtp.from", mail.getFrom());
        expectedProperties.put("mail.smtp.host", mail.getHost());
        expectedProperties.put("mail.smtp.port", mail.getPort());
        expectedProperties.put("mail.smtp.auth", "true");
        expectedProperties.put("mail.smtp." + propertyNamePart + ".enable", true);

        assertEquals(expectedProperties, new MailProperties(mail).create());
    }
}
