package guru.qa.allure.notifications.clients.skype;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.skype.model.Attachment;
import guru.qa.allure.notifications.clients.skype.model.From;
import guru.qa.allure.notifications.clients.skype.model.SkypeMessage;
import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.SkypeSettings;
import guru.qa.allure.notifications.message.MessageText;
import guru.qa.allure.notifications.util.ImageConverter;
import kong.unirest.Unirest;

import java.util.Collections;

public class Skype implements Notifier {
    @Override
    public void sendText() {
        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId", SkypeSettings.conversationId())
                .header("Content-Type", Headers.JSON.header())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(createSimpleMessage())
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Attachment attachment = new Attachment();
        attachment.contentType = "image/png";
        attachment.name = Base.chartName() + ".png";
        attachment.contentUrl = contentUrl();

        SkypeMessage body = createSimpleMessage();
        body.attachments = Collections.singletonList(attachment);

        Unirest.post("https://{url}/apis/v3/conversations/{conversationId}/activities")
                .routeParam("url", host())
                .routeParam("conversationId", SkypeSettings.conversationId())
                .header("Content-Type", Headers.JSON.header())
                .header("Authorization", "Bearer " + token())
                .header("Host", host())
                .body(body)
                .asString()
                .getBody();
    }

    private SkypeMessage createSimpleMessage() {
        From from = new From();
        from.id = SkypeSettings.botId();
        from.name = SkypeSettings.botName();

        SkypeMessage message = new SkypeMessage();
        message.type = "message";
        message.from = from;
        message.text = MessageText.markdown();

        return message;
    }

    private String token() {
        return SkypeAuth.bearerToken();
    }

    private String host() {
        return SkypeSettings.serviceUrl().substring(0, 23);
    }

    private String contentUrl() {
        return String.join(",", "data:image/png;base64",
                ImageConverter.convertToBase64());
    }
}
