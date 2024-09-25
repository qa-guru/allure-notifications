package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.exceptions.MessageSendException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.json.JSONObject;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class SlackClient implements Notifier {
    private final Slack slack;

    public SlackClient(Slack slack) {
        this.slack = slack;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("channel", slack.getChat()));
        params.add(new BasicNameValuePair("text", createMessage(messageData)));

        String errorDescription = "Failed to post message to Slack";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpUriRequest request = RequestBuilder
                    .post("https://slack.com/api/chat.postMessage")
                    .setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8))
                    .build();
            executeRequest(client, request, errorDescription);
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpUriRequest uploadUrlRequest = RequestBuilder
                    .get("https://slack.com/api/files.getUploadURLExternal")
                    .addHeader(HttpHeaders.CONTENT_TYPE, ContentType.APPLICATION_JSON.getMimeType())
                    .addParameter("filename", "chart.png")
                    .addParameter("length", String.valueOf(chartImage.length))
                    .build();
            JSONObject uploadUrlResponse = new JSONObject(
                    executeRequest(client, uploadUrlRequest, "Error getting upload URL"));

            String fileId = uploadUrlResponse.getString("file_id");
            String uploadUrl = uploadUrlResponse.getString("upload_url");

            HttpUriRequest request = RequestBuilder
                    .post(uploadUrl)
                    .setEntity(MultipartEntityBuilder.create()
                            .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                            .addBinaryBody("file", chartImage, ContentType.DEFAULT_BINARY, "chart")
                            .build())
                    .build();
            executeRequest(client, request, "Failed to upload file to Slack");

            HttpUriRequest completeUploadRequest = RequestBuilder
                    .post("https://slack.com/api/files.completeUploadExternal")
                    .addParameter("files", "[{\"id\":\"" + fileId + "\"}]")
                    .addParameter("initial_comment", createMessage(messageData))
                    .addParameter("channel_id", slack.getChat())
                    .build();
            executeRequest(client, completeUploadRequest, "Error complete upload file");
        } catch (IOException e) {
            throw new MessageSendException("Failed to post message with file to Slack", e);
        }
    }

    private String createMessage(MessageData messageData) throws MessageBuildException {
        return new MessageTemplate(messageData).createMessageFromTemplate(slack.getTemplatePath());
    }

    private String executeRequest(CloseableHttpClient client, HttpUriRequest request, String errorDescription)
            throws MessageSendException {
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + slack.getToken());

        try (CloseableHttpResponse responseBody = client.execute(request)) {
            int statusCode = responseBody.getStatusLine().getStatusCode();
            String responseAsString = EntityUtils.toString(responseBody.getEntity());

            if (statusCode == HttpStatus.SC_OK) {
                return responseAsString;
            }
            throw new MessageSendException(
                    String.format("%s. HTTP status code: %d, HTTP response: %s", errorDescription, statusCode,
                            responseAsString));
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }
}
