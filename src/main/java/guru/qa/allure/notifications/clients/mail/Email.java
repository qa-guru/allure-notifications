package guru.qa.allure.notifications.clients.mail;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.template.HTMLTemplate;
import guru.qa.allure.notifications.util.MailUtil;

public class Email implements Notifier {
    private final Letter letter = new Letter(new MailUtil().session());
    private final String text = new HTMLTemplate().create();
    private final Mail mail = ApplicationConfig.newInstance()
            .readConfig().mail();
    private final String project = ApplicationConfig.newInstance()
            .readConfig().base().project();

    @Override
    public void sendText() {
        letter.from(mail.from())
                .to(mail.recipient())
                .subject(project)
                .text(text)
                .send();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        final Letter letter = new Letter(new MailUtil().session());
        String message = "<img src='cid:image'>" + text;

        letter.from(mail.from())
                .to(mail.recipient())
                .subject(project)
                .text(message)
                .image("/chart.png")
                .send();
    }
}
