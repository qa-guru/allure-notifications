package com.github.guru.qa.allure.notifications.client.clients.mail;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;

public class LetterBody {

    private final MimeMultipart mimeMultipart = new MimeMultipart("related");

    public void addText(String body) throws MessagingException {
        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent(body, "text/html; charset=UTF-8");
        mimeMultipart.addBodyPart(messageBodyPart);
    }

    public void addImage(String imagePath) throws MessagingException {
        BodyPart imageBodyPart = new MimeBodyPart();
        DataSource dataSource = new FileDataSource(imagePath);

        imageBodyPart.setDataHandler(new DataHandler(dataSource));
        imageBodyPart.setHeader("Content-ID", "<image>");
        mimeMultipart.addBodyPart(imageBodyPart);
    }

    public MimeMultipart getMimeMultipart() {
        return mimeMultipart;
    }
}