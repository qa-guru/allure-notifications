package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.Unirest;

import java.io.File;

public class TelegramClient implements Notifier {
    private final Base base;
    private final Telegram telegram;
    private final MarkdownTemplate markdownTemplate;

    public TelegramClient(Base base, MessageData messageData, Telegram telegram) {
        this.base = base;
        this.telegram = telegram;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", telegram.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo() + "")
                .field("text", markdownTemplate.create())
                .field("parse_mode", "Markdown")
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() throws MessagingException {
        Chart.createChart(base);

        Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", telegram.token())
                .field("photo",
                        new File("chart.png"))
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo())
                .field("caption", markdownTemplate.create())
                .field("parse_mode", "Markdown")
                .asString()
                .getBody();
    }
}
