package guru.qa.allure.notifications.clients.gitlab;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.gitlab.Gitlab;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class GitlabClient implements Notifier {
    private final Gitlab gitlab;

    public GitlabClient(Gitlab gitlab) {
        this.gitlab = gitlab;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        send(messageData);
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        JsonNode jsonBody = Unirest.post(String.format("%s/api/v4/projects/{projectId}/uploads", gitlab.getUrl()))
                .routeParam("projectId", gitlab.getProjectId())
                .header(gitlab.getApiKey(), gitlab.getApiToken())
                .field("file", new ByteArrayInputStream(chartImage), ContentType.APPLICATION_OCTET_STREAM, "file.png")
                .asJson()
                .getBody();

        jsonBody.getObject().toMap().computeIfPresent("markdown", (k, v) -> messageData.getValues().put("chartSource", v));

        send(messageData);
    }

    private void send(MessageData messageData) throws MessagingException {
        Map<String, Object> body = new HashMap<>();
        body.put("body", MessageTemplate.createMessageFromTemplate(messageData, gitlab.getTemplatePath()));
        Unirest.post(String.format("%s/api/v4/projects/{projectId}/merge_requests/{mergeRequestIid}/notes", gitlab.getUrl()))
                .routeParam("projectId", gitlab.getProjectId())
                .routeParam("mergeRequestIid", gitlab.getMergeRequestIid())
                .header(gitlab.getApiKey(), gitlab.getApiToken())
                .header("Content-Type", ContentType.APPLICATION_JSON.getMimeType())
                .body(body)
                .asString()
                .getBody();
    }

}
