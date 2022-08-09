package guru.qa.allure.notifications.clients.cliq;

import com.google.gson.JsonObject;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;

import java.io.ByteArrayInputStream;

public class CliqClient implements Notifier {
    private final Cliq cliq;
    private final MarkdownTemplate markdownTemplate;

    public CliqClient(MessageData messageData, Cliq cliq) {
        this.cliq = cliq;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        JsonObject body = new JsonObject();
        String url = generateUrl("message");
        body.addProperty("text", markdownTemplate.create());

        Unirest.post(url)
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        String url = generateUrl("files");
        ByteArrayInputStream file = new ByteArrayInputStream(chartImage);
        String comments = new JSONArray().put(markdownTemplate.create()).toString();

        Unirest.post(url)
                .field("files", file, ContentType.IMAGE_PNG.getMimeType())
                .field("comments", comments)
                .asString()
                .getBody();
    }

    private String generateUrl(String type) {
        String url = String.format(
                "https://cliq.zoho.eu/api/v2/channelsbyname/%s/" + type + "?zapikey=%s",
                cliq.getChat(), cliq.getToken()
        );
        if (!cliq.getBot().isEmpty()) {
            url += "&bot_unique_name=" + cliq.getBot();
        }
        return url;
    }
}
