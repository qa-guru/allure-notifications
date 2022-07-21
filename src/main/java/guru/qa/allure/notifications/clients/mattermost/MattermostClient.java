package guru.qa.allure.notifications.clients.mattermost;

import com.jayway.jsonpath.JsonPath;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.ContentType;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.Unirest;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

import static java.util.Collections.singletonList;

public class MattermostClient implements Notifier {
    private final Map<String, Object> body = new HashMap<>();
    private MarkdownTemplate markdownTemplate;
    private final Mattermost mattermost;

    public MattermostClient(MessageData messageData, Mattermost mattermost) {
        this.mattermost = mattermost;
        this.markdownTemplate = new MarkdownTemplate(messageData);
    }

    @Override
    public void sendText() throws MessagingException {
        body.put("channel_id", mattermost.getChat());
        body.put("message", markdownTemplate.create());

        Unirest.post("https://{uri}/api/v4/posts")
                .routeParam("uri", mattermost.getUrl())
                .header("Authorization", "Bearer " +
                        mattermost.getToken())
                .header("Content-Type", Headers.JSON.header())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto(byte[] chartImage) throws MessagingException {
        String response = Unirest.post("https://{uri}/api/v4/files")
                .routeParam("uri", mattermost.getUrl())
                .header("Authorization", "Bearer " +
                        mattermost.getToken())
                .queryString("channel_id", mattermost.getChat())
                .queryString("filename", "chart")
                .field("chart", new ByteArrayInputStream(chartImage), ContentType.IMAGE_PNG, "chart.png")
                .asString()
                .getBody();

        String chartId = JsonPath.read(response, "$.file_infos[0].id");
        body.put("file_ids", singletonList(chartId));
        sendText();
    }
}
