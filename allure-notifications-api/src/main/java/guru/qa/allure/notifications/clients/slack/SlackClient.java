package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.ContentType;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class SlackClient implements Notifier {
    private final Slack slack;

    public SlackClient(Slack slack) {
        this.slack = slack;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            postMessage(client, messageData);
        } catch (IOException e) {
            throw new MessagingException("Failed to post message to Slack", e);
        }
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String title = "chart.png";
            JSONObject uploadResponse = getUploadURLExternal(client, title, chartImage);

            String fileId = uploadResponse.getString("file_id");
            String uploadUrl = uploadResponse.getString("upload_url");

            MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create()
                    .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                    .addBinaryBody("file", new ByteArrayInputStream(chartImage), org.apache.http.entity.ContentType.DEFAULT_BINARY, "chart");

            if (!uploadFile(uploadUrl, multipartEntityBuilder, client)) {
                log.error("Failed to upload file to Slack");
            }

            completeUploadExternal(client, fileId, proceedMessageData(messageData));
        } catch (IOException e) {
            throw new MessagingException("Failed to post message with file to Slack", e);
        }
    }

    private void postMessage(CloseableHttpClient client, MessageData messageData) throws UnsupportedEncodingException {
        HttpUriRequest request = RequestBuilder
                .post("https://slack.com/api/chat.postMessage")
                .addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + slack.getToken())
                .setEntity(new UrlEncodedFormEntity(getTextData(messageData)))
                .build();

        try (CloseableHttpResponse responseBody = client.execute(request)) {
            if (responseBody.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                log.info(EntityUtils.toString(responseBody.getEntity()));
            }
        } catch (IOException | UnsupportedOperationException e) {
            log.error("Error post message", e);
        }
    }

    private boolean uploadFile(String uploadUrl, MultipartEntityBuilder multipartEntityBuilder, CloseableHttpClient client) throws IOException {
        HttpUriRequest request = RequestBuilder
                .post(uploadUrl)
                .setEntity(multipartEntityBuilder.build())
                .addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + slack.getToken())
                .build();

        try (CloseableHttpResponse responseBody = client.execute(request)) {
            if (responseBody.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                return false;
            }
        }
        return true;
    }

    private List<NameValuePair> getTextData(MessageData messageData) {
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("channel", slack.getChat()));
        params.add(new BasicNameValuePair("text", proceedMessageData(messageData)));
        return params;
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

    private JSONObject completeUploadExternal(CloseableHttpClient client, String fileId, String messageData) {
        JSONObject completeUploadResponse = new JSONObject();
        JSONArray array = new JSONArray();
        JSONObject node = new JSONObject();
        node.put("id", fileId);
        array.put(node);

        HttpUriRequest request = RequestBuilder
                .post("https://slack.com/api/files.completeUploadExternal")
                .addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + slack.getToken())
                .addParameter("files", array.toString())
                .addParameter("initial_comment", messageData)
                .addParameter("channel_id", slack.getChat())
                .build();
        try (CloseableHttpResponse responseBody = client.execute(request)) {
            if (responseBody.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                completeUploadResponse = new JSONObject(EntityUtils.toString(responseBody.getEntity()));
            }
        } catch (IOException | UnsupportedOperationException e) {
            log.error("Error complete upload file", e);
        }
        return completeUploadResponse;
    }

    private JSONObject getUploadURLExternal(CloseableHttpClient client, String fileName, byte[] chartImage) {
        JSONObject uploadResponse = new JSONObject();
        HttpUriRequest request = RequestBuilder
                .get("https://slack.com/api/files.getUploadURLExternal")
                .addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + slack.getToken())
                .addHeader(HttpHeaders.CONTENT_TYPE, ContentType.APPLICATION_JSON.getMimeType())
                .addParameter("filename", fileName)
                .addParameter("length", String.valueOf(chartImage.length))
                .build();
        try (CloseableHttpResponse responseBody = client.execute(request)) {
            if (responseBody.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                uploadResponse = new JSONObject(EntityUtils.toString(responseBody.getEntity()));
            }
        } catch (IOException | UnsupportedOperationException e) {
            log.error("Error getting upload URL", e);
        }
        return uploadResponse;
    }
}
