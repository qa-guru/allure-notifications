package guru.qa.allure.notifications.clients.skype;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.skype.model.Attachment;
import guru.qa.allure.notifications.clients.skype.model.From;
import guru.qa.allure.notifications.clients.skype.model.SkypeMessage;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.skype.Skype;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.util.ImageConverter;
import kong.unirest.Unirest;

import java.util.Collections;

public class SkypeClient implements Notifier {
    private final Skype skype = ApplicationConfig.newInstance()
            .readConfig().skype();

    @Override
    public void sendText() throws MessagingException {
        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId",
                        skype.conversationId())
                .header("Content-Type", Headers.JSON.header())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(createSimpleMessage())
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() throws MessagingException {
        Chart.createChart();
        Attachment attachment = new Attachment();
        attachment.contentType = "image/png";
        attachment.name = "chart.png";
        attachment.contentUrl = contentUrl();

        SkypeMessage body = createSimpleMessage();
        body.attachments = Collections.singletonList(attachment);

        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId",
                        skype.conversationId())
                .header("Content-Type", Headers.JSON.header())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(body)
                .asString()
                .getBody();
    }

    private SkypeMessage createSimpleMessage() throws MessageBuildException {
        From from = new From();
        from.id = skype.botId();
        from.name = skype.botName();

        SkypeMessage message = new SkypeMessage();
        message.type = "message";
        message.from = from;
        message.text = new MarkdownTemplate().create();

        return message;
    }

    private String token() {
        return SkypeAuth.bearerToken();
    }

    private String host() {
        return skype.serviceUrl().substring(0, 23);
    }

    private String contentUrl() {
        return String.join(",", "data:image/png;base64",
                ImageConverter.convertToBase64());
    }
}
