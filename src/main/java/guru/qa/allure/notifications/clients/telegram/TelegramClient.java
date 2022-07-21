package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import guru.qa.allure.notifications.template.TelegramTemplate;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class TelegramClient implements Notifier {
    private final Telegram telegram;
    private final TelegramTemplate telegramTemplate;

    public TelegramClient(MessageData messageData, Telegram telegram) {
        this.telegram = telegram;
        this.telegramTemplate = new TelegramTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", telegram.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo() + "")
                .field("text", telegramTemplate.create())
                .field("parse_mode", "HTML")
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
                .field("caption", telegramTemplate.create())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }
}
