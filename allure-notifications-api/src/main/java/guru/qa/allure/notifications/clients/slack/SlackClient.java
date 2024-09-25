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
        String errorDescription = "Failed to post message to Slack";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            List<NameValuePair> postMessageFormData = new ArrayList<>();
            postMessageFormData.add(new BasicNameValuePair("channel", slack.getChat()));
            postMessageFormData.add(new BasicNameValuePair("text", createMessage(messageData)));

            executeRequest(client, "https://slack.com/api/chat.postMessage", postMessageFormData, errorDescription);
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpUriRequest uploadUrlRequest = RequestBuilder
                    .get("https://slack.com/api/files.getUploadURLExternal")
                    .addParameter("filename", "chart.png")
                    .addParameter("length", String.valueOf(chartImage.length))
                    .build();
            JSONObject uploadUrlResponse = new JSONObject(
                    executeRequest(client, uploadUrlRequest, "Error getting upload URL"));

            String fileId = uploadUrlResponse.getString("file_id");
            String uploadUrl = uploadUrlResponse.getString("upload_url");

            HttpUriRequest uploadFileRequest = RequestBuilder
                    .post(uploadUrl)
                    .setEntity(MultipartEntityBuilder.create()
                            .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                            .addBinaryBody("file", chartImage, ContentType.DEFAULT_BINARY, "chart")
                            .build())
                    .build();
            executeRequest(client, uploadFileRequest, "Failed to upload file to Slack");

            List<NameValuePair> completeUploadFormData = new ArrayList<>();
            completeUploadFormData.add(new BasicNameValuePair("files", "[{\"id\":\"" + fileId + "\"}]"));
            completeUploadFormData.add(new BasicNameValuePair("initial_comment", createMessage(messageData)));
            completeUploadFormData.add(new BasicNameValuePair("channel_id", slack.getChat()));

            executeRequest(client, "https://slack.com/api/files.completeUploadExternal", completeUploadFormData,
                    "Error complete upload file");
        } catch (IOException e) {
            throw new MessageSendException("Failed to post message with file to Slack", e);
        }
    }

    private String createMessage(MessageData messageData) throws MessageBuildException {
        return new MessageTemplate(messageData).createMessageFromTemplate(slack.getTemplatePath());
    }

    private void executeRequest(CloseableHttpClient client, String uri, List<NameValuePair> formData,
            String errorDescription) throws MessageSendException {
        HttpUriRequest request = RequestBuilder
                .post(uri)
                .setEntity(new UrlEncodedFormEntity(formData, StandardCharsets.UTF_8))
                .build();
        executeRequest(client, request, errorDescription);
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
