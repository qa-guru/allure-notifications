package com.github.guru.qa.allure.notifications.client.clients;

import com.github.guru.qa.allure.notifications.chart.Chart;
import com.github.guru.qa.allure.notifications.client.Notifier;
import com.github.guru.qa.allure.notifications.client.clients.mail.Letter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.MessagingException;

import static com.github.guru.qa.allure.notifications.message.Text.formattedHtmlMessage;
import static com.github.guru.qa.allure.notifications.utils.MailSettingsHelper.mailTo;
import static com.github.guru.qa.allure.notifications.utils.MailUtils.createSession;
import static com.github.guru.qa.allure.notifications.utils.SettingsHelper.projectName;

public class EmailClient implements Notifier {
    private final Logger LOG = LoggerFactory.getLogger(EmailClient.class);

    @Override
    public void sendText() {
        try {
            Letter letter = new Letter(createSession());

            letter.to(mailTo())
                    .subject(projectName())
                    .text(formattedHtmlMessage())
                    .send();
        } catch (MessagingException e) {
            LOG.error("Can't send mail. Error: {}", e.getLocalizedMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        try {
            Letter letter = new Letter(createSession());
            String message = "<img src='cid:image'>" + formattedHtmlMessage();

            letter.to(mailTo())
                    .subject(projectName())
                    .text(message)
                    .image("./piechart.png")
                    .send();
        } catch (MessagingException e) {
            LOG.error("Can't send mail. Error: {}", e.getLocalizedMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}