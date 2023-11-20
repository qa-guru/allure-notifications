package guru.qa.allure.notifications.clients.rocket;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.rocket.Rocket;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.template.RocketTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import java.io.ByteArrayInputStream;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

public class RocketChatClient implements Notifier {

    private final JSON json = new JSON();
    private final Rocket rocket;
    private final RocketTemplate template;

    public RocketClient(MessageData messageData, Rocket rocket) {
        this.rocket = rocket;
        this.template = new RocketTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        String body = String.format("{\"channel\": \"%s\", \"text\": \"%s\" }",
            rocket.getChannel(), template.create().replace("\r\n", "\\\n"));
        String url = rocket.getUrl() + "/api/v1/chat.postMessage";
        Unirest.post(url)
            .header("X-Auth-Token", rocket.getToken())
            .header("X-User-Id", rocket.getUserId())
            .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
            .body(json.prettyPrint(body))
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
