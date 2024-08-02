package guru.qa.allure.notifications.clients.rocket;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.rocket.RocketChat;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.RocketTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

public class RocketChatClient implements Notifier {
    private final RocketChat rocketChat;

    public RocketChatClient(RocketChat rocket) {
        this.rocketChat = rocket;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        Map<String, Object> body = new HashMap<>();
        body.put("channel", rocketChat.getChannel());
        body.put("text", new RocketTemplate(messageData).create());
        Unirest.post(rocketChat.getUrl() + "/api/v1/chat.postMessage")
            .header("X-Auth-Token", rocketChat.getToken())
            .header("X-User-Id", rocketChat.getUserId())
            .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
            .body(body)
            .asString()
            .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        sendText(messageData);
        String url = String.format("%s/api/v1/rooms.upload/%s", rocketChat.getUrl(), rocketChat.getChannel());
        Unirest.post(url)
            .header("X-Auth-Token", rocketChat.getToken())
            .header("X-User-Id", rocketChat.getUserId())
            .field("file", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
            .asString()
            .getBody();
    }
}
