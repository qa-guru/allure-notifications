package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.helpers.Mail;
import guru.qa.allure.notifications.exceptions.ArgumentNotProvidedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class MailUtil {
    private static final Logger LOG = LoggerFactory.getLogger("Mail Settings");

    public static Session createSession() {
        LOG.info("Creating new session...");
        final Properties properties = new Properties();

        properties.put("mail.smtp.from", Mail.from());
        properties.put("mail.smtp.host", Mail.host());
        properties.put("mail.smtp.ssl.enable", Mail.enableSSL());
        properties.put("mail.smtp.port", Mail.port());
        properties.put("mail.smtp.auth", "true");

        Session session = Session.getDefaultInstance(
                properties,
                new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(Mail.username(),
                                Mail.password());
                    }
                }
        );
        LOG.info("Done.");
        return session;
    }

    public static InternetAddress[] getRecipients(final String addresses) {
        LOG.info("Parsing addresses...");
        final List<InternetAddress> addressList = new ArrayList<>();

        if (addresses == null || addresses.isEmpty()) {
            throw new ArgumentNotProvidedException("recipient");
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
        LOG.info("Done.");
        return addressList.toArray(new InternetAddress[0]);
    }
}
