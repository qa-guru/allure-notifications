package guru.qa.allure.notifications.clients.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;

public class LetterBody {
    private final Logger LOG = LoggerFactory.getLogger("Body");
    private final MimeMultipart multipart = new MimeMultipart("related");

    public void addText(final String body) {
        BodyPart textBody = new MimeBodyPart();
        try {
            textBody.setContent(body, "text/html; charset=UTF-8");
            multipart.addBodyPart(textBody);
        } catch (MessagingException e) {
            LOG.error("Unable to create text body!");
            System.exit(1);
        }
    }

    public void addImage(final String imagePath) {
        BodyPart imageBody = new MimeBodyPart();
        DataSource dataSource = new FileDataSource(imagePath);
        try {
            imageBody.setDataHandler(new DataHandler(dataSource));
            imageBody.setHeader("Content-ID", "<image>");
            multipart.addBodyPart(imageBody);
        } catch (MessagingException e) {
            LOG.error("Unable to create image body!");
            System.exit(1);
        }
    }

    public MimeMultipart getMultipart() {
        return multipart;
    }
}
