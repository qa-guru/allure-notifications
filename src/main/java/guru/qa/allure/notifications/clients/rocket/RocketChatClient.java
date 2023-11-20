package guru.qa.allure.notifications.clients.rocket;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.rocket.Rocket;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.RocketTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

public class RocketChatClient implements Notifier {

    private final Map<String, Object> body = new HashMap<>();
    private final Rocket rocket;
    private final RocketTemplate template;

    public RocketChatClient(MessageData messageData, Rocket rocket) {
        this.rocket = rocket;
        this.template = new RocketTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        body.put("channel", rocket.getChannel());
        body.put("text", template.create());
        Unirest.post(rocket.getUrl() + "/api/v1/chat.postMessage")
            .header("X-Auth-Token", rocket.getToken())
            .header("X-User-Id", rocket.getUserId())
            .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
            .body(body)
            .asString()
            .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        sendText();
        String url = String.format("%s/api/v1/rooms.upload/%s", rocket.getUrl(), rocket.getChannel());
        Unirest.post(url)
            .header("X-Auth-Token", rocket.getToken())
            .header("X-User-Id", rocket.getUserId())
            .field("file", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
            .asString()
            .getBody();
    }
}
