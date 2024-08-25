package guru.qa.allure.notifications.clients.slack;

import com.google.gson.Gson;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.slack.model.ImageBlock;
import guru.qa.allure.notifications.clients.slack.model.SectionBlock;
import guru.qa.allure.notifications.clients.slack.model.TextObject;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONObject;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@Slf4j
public class SlackClient implements Notifier {
    private final Slack slack;

    public SlackClient(Slack slack) {
        this.slack = slack;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        postMessage(messageData);
    }

    @Override
    @SneakyThrows
    public void sendPhoto(MessageData messageData, byte[] chartImage) {
        String title = "chart.png";
        JSONObject uploadResponse = getUploadURLExternal(title, chartImage);

        String fileId = uploadResponse.getString("file_id");
        String uploadUrl = uploadResponse.getString("upload_url");

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create()
                    .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                    .addBinaryBody("file", new ByteArrayInputStream(chartImage), org.apache.http.entity.ContentType.DEFAULT_BINARY, "chart");

            if (!uploadFile(uploadUrl, multipartEntityBuilder, client)) {
                log.error("Failed to upload file to Slack");
            }
        } catch (IOException e) {
            log.error("Failed to upload file to Slack", e);
        }

        //todo wait until file processing to complete
        Thread.sleep(2000);

        JSONObject completeResponse = completeUploadExternal(fileId, title);

        String filePermalink = completeResponse.getJSONArray("files").getJSONObject(0).getString("permalink");

        postMessage(messageData, filePermalink);
    }

    private void postMessage(MessageData messageData) {
        postMessage(messageData, "");
    }

    private void postMessage(MessageData messageData, String fileUrl) {
        if (fileUrl.isEmpty()) {
            Unirest.post("https://slack.com/api/chat.postMessage")
                    .header("Authorization", "Bearer " + slack.getToken())
                    .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                    .body(getTextData(messageData))
                    .asString()
                    .getBody();
        } else {
            Unirest.post("https://slack.com/api/chat.postMessage")
                    .header("Authorization", "Bearer " + slack.getToken())
                    .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                    .queryString("channel", slack.getChat())
                    .queryString("blocks", getBlocksForPostMessage(messageData, fileUrl))
                    .asString()
                    .getBody();
        }
    }

    private boolean uploadFile(String uploadUrl, MultipartEntityBuilder multipartEntityBuilder, CloseableHttpClient client) throws IOException {
        HttpUriRequest request = RequestBuilder
                .post(uploadUrl)
                .setEntity(multipartEntityBuilder.build())
                .addHeader("Authorization", "Bearer " + slack.getToken())
                .build();

        try (CloseableHttpResponse responseBody = client.execute(request)) {
            if (responseBody.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                return false;
            }
        }
        return true;
    }

    private String getTextData(MessageData messageData) {
        return String.format("channel=%s&text=%s", slack.getChat(), proceedMessageData(messageData));
    }

    private String getBlocksForPostMessage(MessageData messageData, String imageUrl) {
        SectionBlock sectionBlock = SectionBlock.builder().text(TextObject.builder().text(proceedMessageData(messageData)).build()).build();
        ImageBlock imageBlock = ImageBlock.builder().imageUrl(imageUrl).altText("chart").build();
        return new Gson().toJson(List.of(sectionBlock, imageBlock));
    }

    private String proceedMessageData(MessageData messageData) {
        String text = "";
        try {
            text = new MessageTemplate(messageData).createMessageFromTemplate(slack.getTemplatePath());
        } catch (MessagingException e) {
            log.error("Could not create message from template", e);
        }
        return text;
    }

    private JSONObject completeUploadExternal(String fileId, String title) {
        JSONArray array = new JSONArray();
        JSONObject node = new JSONObject();
        node.put("id", fileId);
        node.put("title", title);
        array.put(node);

        return Unirest.post("https://slack.com/api/files.completeUploadExternal")
                .header("Authorization", "Bearer " + slack.getToken())
                .queryString("files", array)
                .asJson().getBody().getObject();
    }

    private JSONObject getUploadURLExternal(String fileName, byte[] chartImage) {
        return Unirest.get("https://slack.com/api/files.getUploadURLExternal")
                .header("Authorization", "Bearer " + slack.getToken())
                .queryString("filename", fileName)
                .queryString("length", chartImage.length)
                .asJson().getBody().getObject();
    }
}
