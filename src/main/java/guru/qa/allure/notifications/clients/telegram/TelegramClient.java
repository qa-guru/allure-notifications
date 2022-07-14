package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class TelegramClient implements Notifier {
    private final Telegram telegram;
    private final MarkdownTemplate markdownTemplate;

    public TelegramClient(Base base, Telegram telegram) {
        this.telegram = telegram;
        this.markdownTemplate = new MarkdownTemplate(base);
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
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", telegram.token())
                .field("photo", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo())
                .field("caption", markdownTemplate.create())
                .field("parse_mode", "Markdown")
                .asString()
                .getBody();
    }
}
