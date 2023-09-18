package guru.qa.allure.notifications.clients.loop;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.loop.Loop;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.util.HashMap;
import java.util.Map;

public class LoopClient implements Notifier {
    private final Loop loop;
    private final MarkdownTemplate markdownTemplate;

    public LoopClient(MessageData messageData, Loop loop) {
        this.loop = loop;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        Map<String, Object> body = new HashMap<>();
        body.put("text", markdownTemplate.create());

        Unirest.post(loop.getWebHookUrl())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        Map<String, Object> body = new HashMap<>();
        body.put("text", markdownTemplate.create());

        Unirest.post(loop.getWebHookUrl())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }
}
