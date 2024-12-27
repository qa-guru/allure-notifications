package guru.qa.allure.notifications.clients.cliq;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;

import java.io.ByteArrayInputStream;

public class CliqClient implements Notifier {
    private final Cliq cliq;

    public CliqClient(Cliq cliq) {
        this.cliq = cliq;
    }


    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        JSONArray commentsArray = new JSONArray();
        commentsArray.put(MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath()));

        Unirest.post(generateUrl("message"))
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("text", commentsArray.toString())
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        try {
            ByteArrayInputStream file = new ByteArrayInputStream(chartImage);
            JSONArray commentsArray = new JSONArray();
            commentsArray.put(MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath()));

            Unirest.post(generateUrl("files"))
                    .field("files", file, ContentType.IMAGE_PNG.getMimeType())
                    .field("comments", commentsArray.toString())
                    .asString()
                    .getBody();
        } catch (Exception e) {
            throw new MessagingException("Failed to send photo with comments", e);
        }
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