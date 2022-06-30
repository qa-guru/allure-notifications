package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.HTMLTemplate;

public class Email implements Notifier {
    private final Base base;
    private final Mail mail;
    private final Letter letter;
    private final HTMLTemplate htmlTemplate;

    public Email(Base base, Mail mail) {
        this.base = base;
        this.mail = mail;
        this.letter = new Letter(mail);
        this.htmlTemplate = new HTMLTemplate(base);
    }

    @Override
    public void sendText() throws MessagingException {
        letter.from(mail.from())
                .to(mail.recipient())
                .subject(base.project())
                .text(htmlTemplate.create())
                .send();
    }

    @Override
    public void sendPhoto()  throws MessagingException {
        Chart.createChart(base);
        String message = "<img src='cid:image'>" + htmlTemplate.create();

        letter.from(mail.from())
                .to(mail.recipient())
                .subject(base.project())
                .text(message)
                .image("/chart.png")
                .send();
    }
}
