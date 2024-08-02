package guru.qa.allure.notifications.clients.loop;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.loop.Loop;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class LoopClient implements Notifier {
    private final Loop loop;

    public LoopClient(Loop loop) {
        this.loop = loop;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        Map<String, Object> body = new HashMap<>();
        body.put("text", new MarkdownTemplate(messageData).create());

        Unirest.post(loop.getWebhookUrl())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        String encodedChartImage = Base64.getEncoder().encodeToString(chartImage);

        Map<String, Object> body = new HashMap<>();
        body.put("text", new MarkdownTemplate(messageData).create());

        Map<String, String> attachment = new HashMap<>();
        attachment.put("image_url", "data:image/png;base64," + encodedChartImage);
        body.put("attachments", new Object[]{attachment});

        Unirest.post(loop.getWebhookUrl())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }
}
