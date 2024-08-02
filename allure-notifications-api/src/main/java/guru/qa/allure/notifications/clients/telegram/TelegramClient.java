package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.TelegramTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class TelegramClient implements Notifier {
    private final Telegram telegram;

    public TelegramClient(Telegram telegram) {
        this.telegram = telegram;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", telegram.token())
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo() + "")
                .field("text", new TelegramTemplate(messageData).create())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", telegram.token())
                .field("photo", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo())
                .field("caption", new TelegramTemplate(messageData).create())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }
}
