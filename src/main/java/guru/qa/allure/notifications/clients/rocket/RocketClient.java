package guru.qa.allure.notifications.clients.rocket;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.rocket.Rocket;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class RocketClient implements Notifier {
    private final Rocket rocket;
    private final MarkdownTemplate markdownTemplate;

    public RocketClient(MessageData messageData, Rocket rocket) {
        this.rocket = rocket;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        String body = String.format("{\"channel\": \"%s\", \"text\": \"%s\" }",
                rocket.getChannel(), markdownTemplate.create());
        String url = String.format("%s/api/v1/chat.postMessage", rocket.getUrl());

        Unirest.post(url)
                .header("X-Auth-Token", rocket.getToken())
                .header("X-User-Id", rocket.getUserId())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        String url = String.format("%s/api/v1/rooms.upload/%s", rocket.getUrl(), rocket.getChannel());

        Unirest.post(url)
                .header("X-Auth-Token", rocket.getToken())
                .header("X-User-Id", rocket.getUserId())
                .field("file", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("msg", "Test launch report")
                .field("description", markdownTemplate.create())
                .asString()
                .getBody();
    }
}
