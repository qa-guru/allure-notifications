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

public class TelegramClient implements Notifier {
    private final Telegram telegram;

    public TelegramClient(Telegram telegram) {
        this.telegram = telegram;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        MultipartBody bodyBuilder = Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("text", MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath()));

        configureCommonParameters(bodyBuilder);

        bodyBuilder.asString().getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        MultipartBody bodyBuilder = Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .field("photo", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("caption", MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath()));

        configureCommonParameters(bodyBuilder);

        bodyBuilder.asString().getBody();
    }

    private void configureCommonParameters(MultipartBody bodyBuilder) {
        bodyBuilder
                .routeParam("token", telegram.getToken())
                .field("chat_id", telegram.getChat())
                .field("reply_to_message_id", telegram.getReplyTo())
                .field("parse_mode", "HTML");

        if (this.telegram.getTopic() != null) {
            bodyBuilder.field("message_thread_id", this.telegram.getTopic());
        }
    }
}
