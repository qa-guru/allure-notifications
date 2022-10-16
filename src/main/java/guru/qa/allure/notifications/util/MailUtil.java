package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import lombok.extern.slf4j.Slf4j;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
@Slf4j
public class MailUtil {

    public static Session session(Mail mail) {
        log.info("Creating new session");
        Properties properties = new MailProperties(mail).create();
        return Session.getDefaultInstance(
                properties,
                new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(mail.getUsername(),
                                mail.getPassword());
                    }
                }
        );
    }

    public static InternetAddress[] recipients(String addresses) {
        log.info("Parsing addresses");
        List<InternetAddress> addressList = new ArrayList<>();

        if (addresses == null || addresses.isEmpty()) {
            throw new InvalidArgumentException("Recipients can't be null!");
        }

        String[] addressesArray = addresses.split(", ");
        for (String address : addressesArray) {
            try {
                addressList.add(new InternetAddress(address));
            } catch (AddressException e) {
                log.error("Invalid email address {}!", address);
                System.exit(1);
            }
        }

        InternetAddress[] recipients = addressList.toArray(new InternetAddress[0]);
        log.info("Recipients: {}", Arrays.toString(recipients));
        return recipients;
    }
}
