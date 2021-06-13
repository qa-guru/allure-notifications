package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Base;
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
                .text(MessageText.html())
                .send();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        final Letter letter = new Letter(MailUtil.createSession());
        String message = "<img src='cid:image'>" + MessageText.html();

        letter.from(Mail.from())
                .to(Mail.recipient())
                .subject(Build.job())
                .text(message)
                .image(String.format("./%s.png", Base.chartName()))
                .send();
    }
}
