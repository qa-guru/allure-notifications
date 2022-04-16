package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

public class MailUtil {
    private static final Logger LOG = LoggerFactory.getLogger("Mail Settings");
    private final Mail mail = ApplicationConfig.newInstance()
            .readConfig().mail();

    public Session session() {
        LOG.info("Creating new session");
        Properties properties = new MailProperties().create();
        return Session.getDefaultInstance(
                properties,
                new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(mail.username(),
                                mail.password());
                    }
                }
        );
    }

    public InternetAddress[] recipients(String addresses) {
        LOG.info("Parsing addresses");
        List<InternetAddress> addressList = new ArrayList<>();

        if (addresses == null || addresses.isEmpty()) {
            throw new InvalidArgumentException("Recipients can't be null!");
        }

        String[] addressesArray = addresses.split(", ");
        for (String address : addressesArray) {
            try {
                addressList.add(new InternetAddress(address));
            } catch (AddressException e) {
                LOG.error("Invalid email address {}!", address);
                System.exit(1);
            }
        }

        InternetAddress[] recipients = addressList.toArray(new InternetAddress[0]);
        LOG.info("Recipients: {}", Arrays.toString(recipients));
        return recipients;
    }
}
