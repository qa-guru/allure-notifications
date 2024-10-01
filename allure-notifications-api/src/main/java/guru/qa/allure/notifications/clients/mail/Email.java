package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Email implements Notifier {
    private final Mail mail;
    private final Letter letter;

    public Email(Mail mail) {
        this.mail = mail;
        this.letter = new Letter(mail);
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        getBaseLetter(messageData)
                .text(MessageTemplate.createMessageFromTemplate(messageData, mail.getTemplatePath()))
                .send();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage)  throws MessagingException {
        String message = "<img src='cid:image'/><br/>" + MessageTemplate.createMessageFromTemplate(messageData, 
                mail.getTemplatePath());
        getBaseLetter(messageData)
                .text(message)
                .image(chartImage)
                .send();
    }

    private Letter getBaseLetter(MessageData messageData) throws MessageBuildException {
        return letter.from(mail.getFrom())
                .to(getTo())
                .cc(mail.getCc())
                .bcc(mail.getBcc())
                .subject(messageData.getProject());
    }

    private String getTo() {
        String mailTo = mail.getRecipient();
        if (null != mailTo) {
            log.warn("Deprecated \"recipient\" field found in configuration file, use \"to\" field instead.");
            if (null != mail.getTo()) {
                throw new IllegalArgumentException("Ambiguous configuration fields \"recipient\" and \"to\" found, "
                        + "use only \"to\" field instead.");
            }
        } else {
            mailTo = mail.getTo();
        }
        return mailTo;
    }
}
