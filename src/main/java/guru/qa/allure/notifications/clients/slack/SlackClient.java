package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;

public class SlackClient implements Notifier {
    private final Slack slack;
    private final MarkdownTemplate markdownTemplate;

    public SlackClient(MessageData messageData, Slack slack) {
        this.slack = slack;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        String body = String.format("channel=%s&text=%s",
                slack.getChat(), markdownTemplate.create());

        Unirest.post("https://slack.com/api/chat.postMessage")
                .header("Authorization", "Bearer " + slack.getToken())
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        Unirest.post("https://slack.com/api/files.upload")
                .header("Authorization", "Bearer " + slack.getToken())
                .field("file", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .field("channels", slack.getChat())
                .field("filename", " ")
                .field("initial_comment", markdownTemplate.create())
                .asString()
                .getBody();
    }
}
