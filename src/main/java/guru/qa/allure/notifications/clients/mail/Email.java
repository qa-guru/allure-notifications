package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Build;
import guru.qa.allure.notifications.config.helpers.Mail;
import guru.qa.allure.notifications.message.MessageText;
import guru.qa.allure.notifications.util.MailUtil;

public class Email implements Notifier {
    @Override
    public void sendText() {
        final Letter letter = new Letter(MailUtil.createSession());

        letter.from(Mail.from())
                .to(Mail.recipient())
                .subject(Build.job())
                .body(MessageText.html())
                .send();
    }
}
