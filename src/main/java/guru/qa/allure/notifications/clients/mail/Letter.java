package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.util.MailUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class Letter {
    private final Logger LOG = LoggerFactory.getLogger("Letter");
    private final LetterBody body = new LetterBody();
    private final Message letter;

    public Letter(Session session) {
        letter = new MimeMessage(session);
    }

    public Letter from(final String from) {
        LOG.info("Setting sender...");
        try {
            letter.setFrom(new InternetAddress(from));
        } catch (MessagingException e) {
            LOG.error("Unable to set sender {}!", from);
            System.exit(1);
        }
        return this;
    }

    public Letter to(final String to) {
        LOG.info("Setting recipients...");
        try {
            letter.setRecipients(
                    Message.RecipientType.TO,
                    MailUtil.getRecipients(to)
            );
        } catch (MessagingException e) {
            LOG.error("Unable to set recipients {}!", to);
            System.exit(1);
        }
        LOG.info("Done.");
        return this;
    }

    public Letter subject(final String subject) {
        LOG.info("Setting subject...");
        try {
            letter.setSubject(subject);
        } catch (MessagingException e) {
            LOG.error("Unable to set subject {}!", subject);
            System.exit(1);
        }
        LOG.info("Done.");
        return this;
    }

    public Letter body(final String content) {
        LOG.info("Setting body...");
        body.addText(content);
        LOG.info("Done.");
        return this;
    }

    public void send() {
        LOG.info("Sending mail...");
        try {
            letter.setContent(body.getMultipart());
            Transport.send(letter);
        } catch (MessagingException e) {
            LOG.error("Unable to send message! {}", e.getCause().getLocalizedMessage());
            System.exit(1);
        }
        LOG.info("Done.");
    }
}
