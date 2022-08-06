package guru.qa.allure.notifications.clients.cliq;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

public class CliqClient implements Notifier {
    private final Cliq cliq;
    private final MarkdownTemplate markdownTemplate;

    public CliqClient(MessageData messageData, Cliq cliq) {
        this.cliq = cliq;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        Map<String, Object> body = new HashMap() {{
            put("text", markdownTemplate.create());
        }};

        String url = String.format("https://cliq.zoho.eu/api/v2/channelsbyname/%s/message?zapikey=%s",
                cliq.getChat(), cliq.getToken());

        Unirest.post(url)
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        String url = String.format("https://cliq.zoho.eu/api/v2/channelsbyname/%s/files?zapikey=%s",
                cliq.getChat(), cliq.getToken());

        String comments = new JSONArray().put(markdownTemplate.create()).toString();

        Unirest.post(url)
                .field("files", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG.getMimeType())
                .field("comments", comments)
                .asString()
                .getBody();
    }
}
