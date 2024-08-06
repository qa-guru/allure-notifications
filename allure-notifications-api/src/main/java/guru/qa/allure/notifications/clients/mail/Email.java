package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;

public class Email implements Notifier {
    private final Mail mail;
    private final Letter letter;

    public Email(Mail mail) {
        this.mail = mail;
        this.letter = new Letter(mail);
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(messageData.getProject())
                .text(new MessageTemplate(messageData).createMessageFromTemplate(mail.getTemplatePath()))
                .send();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage)  throws MessagingException {
        String message = "<img src='cid:image'/><br/>" + new MessageTemplate(messageData).createMessageFromTemplate(
                mail.getTemplatePath());
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(messageData.getProject())
                .text(message)
                .image(chartImage)
                .send();
    }
}
