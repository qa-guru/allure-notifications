package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.HTMLTemplate;
import guru.qa.allure.notifications.template.data.MessageData;

public class Email implements Notifier {
    private final String project;
    private final Mail mail;
    private final Letter letter;
    private final HTMLTemplate htmlTemplate;

    public Email(MessageData messageData, Mail mail) {
        this.mail = mail;
        this.letter = new Letter(mail);
        this.htmlTemplate = new HTMLTemplate(messageData);
        this.project = messageData.getProject();
    }

    @Override
    public void sendText() throws MessagingException {
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(project)
                .text(htmlTemplate.create())
                .send();
    }

    @Override
    public void sendPhoto(byte[] chartImage)  throws MessagingException {
        String message = "<img src='cid:image'/><br/>" + htmlTemplate.create();
        letter.from(mail.getFrom())
                .to(mail.getRecipient())
                .subject(project)
                .text(message)
                .image(chartImage)
                .send();
    }
}
