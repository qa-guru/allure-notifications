package guru.qa.allure.notifications.clients.skype;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.skype.model.Attachment;
import guru.qa.allure.notifications.clients.skype.model.From;
import guru.qa.allure.notifications.clients.skype.model.SkypeMessage;
import guru.qa.allure.notifications.config.skype.Skype;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.ContentType;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.Unirest;

import java.util.Base64;
import java.util.Collections;

public class SkypeClient implements Notifier {
    private final Skype skype;

    public SkypeClient(Skype skype) {
        this.skype = skype;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId",
                        skype.getConversationId())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(createSimpleMessage(messageData))
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        Attachment attachment = Attachment.builder()
                .contentType(ContentType.IMAGE_PNG.toString())
                .name("chart.png")
                .contentUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(chartImage))
                .build();

        SkypeMessage body = createSimpleMessage(messageData);
        body.setAttachments(Collections.singletonList(attachment));

        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId",
                        skype.getConversationId())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(body)
                .asString()
                .getBody();
    }

    private SkypeMessage createSimpleMessage(MessageData messageData) throws MessageBuildException {
        From from = From.builder()
                .id(skype.getBotId())
                .name(skype.getBotName())
                .build();

        return SkypeMessage.builder()
                .type("message")
                .from(from)
                .text(new MarkdownTemplate(messageData).create())
                .build();
    }

    private String token() {
        return SkypeAuth.bearerToken(skype);
    }

    private String host() {
        return skype.getServiceUrl().substring(0, skype.getServiceUrl().contains("/")
                ? skype.getServiceUrl().indexOf("/") :
                skype.getServiceUrl().length());
    }
}
