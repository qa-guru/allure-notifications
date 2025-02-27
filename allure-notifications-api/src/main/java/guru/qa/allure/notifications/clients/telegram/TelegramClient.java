package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.MultipartBody;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

public class TelegramClient implements Notifier {
    private final Telegram telegram;

    public TelegramClient(Telegram telegram) {
        this.telegram = telegram;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        MultipartBody multipartBody = Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", telegram.getToken())
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("chat_id", telegram.getChat())
                .field("reply_to_message_id", telegram.getReplyTo() + "")
                .field("text", MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath()))
                .field("parse_mode", "HTML");

        if (telegram.getMessageThreadId() != null) {
            multipartBody.field("message_thread_id", telegram.getMessageThreadId());
        }

        multipartBody.asString().getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        MultipartBody multipartBody = Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", telegram.getToken())
                .field("photo", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("chat_id", telegram.getChat())
                .field("reply_to_message_id", telegram.getReplyTo())
                .field("caption", MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath()))
                .field("parse_mode", "HTML");

        if (telegram.getMessageThreadId() != null) {
           multipartBody.field("message_thread_id", telegram.getMessageThreadId());
        }

        multipartBody.asString().getBody();
    }
}
