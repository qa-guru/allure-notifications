package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessageSendException;
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

    public Letter from(final String from) throws MessageBuildException {
        LOG.info("Setting sender...");
        try {
            letter.setFrom(new InternetAddress(from));
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set sender %s!", from), e);
        }
        return this;
    }

    public Letter to(final String to) throws MessageBuildException {
        LOG.info("Setting recipients...");
        try {
            letter.setRecipients(
                    Message.RecipientType.TO,
                    new MailUtil().recipients(to)
            );
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set recipients %s!", to), e);
        }
        LOG.info("Done.");
        return this;
    }

    public Letter subject(final String subject) throws MessageBuildException {
        LOG.info("Setting subject...");
        try {
            letter.setSubject(subject);
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set subject %s!", subject), e);
        }
        LOG.info("Done.");
        return this;
    }

    public Letter text(final String content) throws MessageBuildException {
        LOG.info("Setting text...");
        body.addText(content);
        LOG.info("Done.");
        return this;
    }

    public Letter image(final String imagePath) throws MessageBuildException {
        LOG.info("Setting image...");
        body.addImage(imagePath);
        LOG.info("Done.");
        return this;
    }

    public void send() throws MessageSendException {
        LOG.info("Sending mail...");
        try {
            letter.setContent(body.getMultipart());
            Transport.send(letter);
        } catch (MessagingException e) {
            throw new MessageSendException("Unable to send message!", e);
        }
        LOG.info("Done.");
    }
}
