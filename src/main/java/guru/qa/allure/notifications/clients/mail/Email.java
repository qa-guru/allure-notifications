package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.HTMLTemplate;
import guru.qa.allure.notifications.template.data.MessageData;

public class Email implements Notifier {
    private final Base base;
    private final Mail mail;
    private final Letter letter;
    private final HTMLTemplate htmlTemplate;

    public Email(Base base, MessageData messageData, Mail mail) {
        this.base = base;
        this.mail = mail;
        this.letter = new Letter(mail);
        this.htmlTemplate = new HTMLTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(base.getProject())
                .text(htmlTemplate.create())
                .send();
    }

    @Override
    public void sendPhoto(byte[] chartImage)  throws MessagingException {
        String message = "<img src='cid:image'/><br/>" + htmlTemplate.create();
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(base.getProject())
                .text(message)
                .image(chartImage)
                .send();
    }
}
