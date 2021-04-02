package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.*;
import javax.mail.internet.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import static com.github.guru.qa.allure.notifications.message.Text.formattedHtmlMessage;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.*;

public class EmailClient implements Notifier {
    private final Logger LOG = LoggerFactory.getLogger(EmailClient.class);
    private final MimeMultipart multipart = new MimeMultipart("related");
    private final Message letter = new MimeMessage(createSession());
    private BodyPart messageBodyPart = new MimeBodyPart();

    @Override
    public void sendText() {
        try {
            letter.setFrom(new InternetAddress(mailFrom()));
            letter.setRecipients(Message.RecipientType.TO, parseAddressesFromString(mailTo()));
            letter.setSubject(projectName());
            letter.setSentDate(new Date());

            messageBodyPart.setContent(formattedHtmlMessage(), "text/html; charset=UTF-8");
            multipart.addBodyPart(messageBodyPart);

            letter.setContent(multipart);
            LOG.info("Trying to send mail...");
            Transport.send(letter);
            LOG.info("Mail sent to {}", mailTo());
        } catch (MessagingException e) {
            LOG.error("Can't send mail. Error: {}", e.getLocalizedMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        try {
            String htmlText = "<img src='cid:image'>" + formattedHtmlMessage();
            DataSource dataSource = new FileDataSource("./piechart.png");

            letter.setFrom(new InternetAddress(mailFrom()));
            letter.setRecipients(Message.RecipientType.TO, parseAddressesFromString(mailTo()));
            letter.setSubject(projectName());
            letter.setSentDate(new Date());

            messageBodyPart.setContent(htmlText, "text/html; charset=UTF-8");
            multipart.addBodyPart(messageBodyPart);

            messageBodyPart = new MimeBodyPart();
            messageBodyPart.setDataHandler(new DataHandler(dataSource));
            messageBodyPart.setHeader("Content-ID", "<image>");
            multipart.addBodyPart(messageBodyPart);

            letter.setContent(multipart);
            LOG.info("Trying to send mail...");
            Transport.send(letter);
            LOG.info("Mail sent to {}", mailTo());
        } catch (MessagingException e) {
            LOG.error("Can't send mail. Error: {}", e.getLocalizedMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private Session createSession() {
        Properties props = new Properties();

        props.put("mail.smtp.host", mailHost());
        props.put("mail.smtp.ssl.enable", mailSslEnable());
        props.put("mail.smtp.port", mailPort());
        props.put("mail.smtp.auth", "true");

        return Session.getDefaultInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(mailUsername(), mailPassword());
            }
        });
    }

    private InternetAddress[] parseAddressesFromString(String addresses) throws AddressException {
        ArrayList<InternetAddress> addressList = new ArrayList<>();
        if (addresses == null) {
            LOG.error("Email not specified");
            System.exit(1);
        }
        String[] addressesArray = addresses.split(" ");

        if (addressesArray.length > 3) {
            LOG.error("Can't send mail more than 3 addresses");
            System.exit(1);
        }
        for (String address : addressesArray) {
            addressList.add(new InternetAddress(address));
        }
        return addressList.toArray(new InternetAddress[0]);
    }
}