package guru.qa.allure.notifications.clients.teams;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.teams.Teams;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TeamsClient implements Notifier {
    private static final String ADAPTIVE_CARD_CONTENT_TYPE = "application/vnd.microsoft.card.adaptive";
    private static final String ADAPTIVE_CARD_SCHEMA = "http://adaptivecards.io/schemas/adaptive-card.json";
    private static final String ADAPTIVE_CARD_VERSION = "1.5";

    private final Teams teams;

    public TeamsClient(Teams teams) {
        this.teams = teams;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        send(buildPayload(renderText(messageData), null));
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        String dataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(chartImage);
        send(buildPayload(renderText(messageData), dataUri));
    }

    private String renderText(MessageData messageData) throws MessageBuildException {
        return MessageTemplate.createMessageFromTemplate(messageData, teams.getTemplatePath());
    }

    private Map<String, Object> buildPayload(String text, String imageDataUri) {
        List<Map<String, Object>> body = new ArrayList<>();

        Map<String, Object> textBlock = new HashMap<>();
        textBlock.put("type", "TextBlock");
        textBlock.put("text", text);
        textBlock.put("wrap", true);
        body.add(textBlock);

        if (imageDataUri != null) {
            Map<String, Object> image = new HashMap<>();
            image.put("type", "Image");
            image.put("url", imageDataUri);
            body.add(image);
        }

        Map<String, Object> card = new HashMap<>();
        card.put("$schema", ADAPTIVE_CARD_SCHEMA);
        card.put("type", "AdaptiveCard");
        card.put("version", ADAPTIVE_CARD_VERSION);
        card.put("body", body);

        Map<String, Object> attachment = new HashMap<>();
        attachment.put("contentType", ADAPTIVE_CARD_CONTENT_TYPE);
        attachment.put("contentUrl", null);
        attachment.put("content", card);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "message");
        payload.put("attachments", Collections.singletonList(attachment));
        return payload;
    }

    private void send(Map<String, Object> payload) {
        Unirest.post(teams.getWebhookUrl())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(payload)
                .asString()
                .getBody();
    }
}
