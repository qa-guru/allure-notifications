package guru.qa.allure.notifications.clients.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    public MimeMultipart getMultipart() {
        return multipart;
    }
}
