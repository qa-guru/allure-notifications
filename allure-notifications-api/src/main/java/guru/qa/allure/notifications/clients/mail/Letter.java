package guru.qa.allure.notifications.clients.mail;

import static jakarta.mail.Message.RecipientType;

import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessageSendException;
import guru.qa.allure.notifications.util.MailUtil;
import lombok.extern.slf4j.Slf4j;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Slf4j
public class Letter {
    private final LetterBody body = new LetterBody();
    private final Message letter;

    public Letter(Mail mail) {
        letter = new MimeMessage(MailUtil.session(mail));
    }

    public Letter from(final String from) throws MessageBuildException {
        log.info("Setting sender...");
        try {
            letter.setFrom(new InternetAddress(from));
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set sender %s!", from), e);
        }
        return this;
    }

    public Letter to(final String to) throws MessageBuildException {
        log.info("Setting recipients...");
        try {
            letter.setRecipients(
                    RecipientType.TO,
                    MailUtil.recipients(to)
            );
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set recipients %s!", to), e);
        }
        log.info("Done.");
        return this;
    }

    public Letter cc(final String cc) throws MessageBuildException {
        return setRecipientsWithTypeIfPresentedInConfig(RecipientType.CC, cc);
    }

    public Letter bcc(final String bcc) throws MessageBuildException {
        return setRecipientsWithTypeIfPresentedInConfig(RecipientType.BCC, bcc);
    }

    private Letter setRecipientsWithTypeIfPresentedInConfig(RecipientType type, String recipients)
            throws MessageBuildException {
        try {
            if (null != recipients) {
                letter.setRecipients(
                        type,
                        MailUtil.recipients(recipients)
                );
            }
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set recipients %s with type %s!",
                    recipients, type), e);
        }
        return this;
    }

    public Letter subject(final String subject) throws MessageBuildException {
        log.info("Setting subject...");
        try {
            letter.setSubject(subject);
        } catch (MessagingException e) {
            throw new MessageBuildException(String.format("Unable to set subject %s!", subject), e);
        }
        log.info("Done.");
        return this;
    }

    public Letter text(final String content) throws MessageBuildException {
        log.info("Setting text...");
        body.addText(content);
        log.info("Done.");
        return this;
    }

    public Letter image(final byte[] image) throws MessageBuildException {
        log.info("Setting image...");
        body.addImage(image);
        log.info("Done.");
        return this;
    }

    public void send() throws MessageSendException {
        log.info("Sending mail...");
        try {
            letter.setContent(body.getMultipart());
            Transport.send(letter);
        } catch (MessagingException e) {
            throw new MessageSendException("Unable to send message!", e);
        }
        log.info("Done.");
    }
}
