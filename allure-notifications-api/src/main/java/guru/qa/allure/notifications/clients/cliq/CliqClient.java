package guru.qa.allure.notifications.clients.cliq;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.exceptions.MessageSendException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CliqClient implements Notifier {
    
    private static final Map<String, String> DATA_CENTER_DOMAINS = new HashMap<>();
    
    private final Cliq cliq;
    
    static {
        DATA_CENTER_DOMAINS.put("com", "cliq.zoho.com");
        DATA_CENTER_DOMAINS.put("eu", "cliq.zoho.eu");
        DATA_CENTER_DOMAINS.put("in", "cliq.zoho.in");
        DATA_CENTER_DOMAINS.put("au", "cliq.zoho.com.au");
        DATA_CENTER_DOMAINS.put("jp", "cliq.zoho.jp");
        DATA_CENTER_DOMAINS.put("ca", "cliq.zohocloud.ca");
    }

    public CliqClient(Cliq cliq) {
        this.cliq = cliq;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        String errorDescription = "Failed to post message to Zoho Cliq";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            List<NameValuePair> formData = new ArrayList<>();
            formData.add(new BasicNameValuePair("text", 
                    MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath())));
            
            executeRequest(client, generateUrl("message"), formData, errorDescription);
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        String errorDescription = "Failed to post message with file to Zoho Cliq";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            MultipartEntityBuilder entityBuilder = MultipartEntityBuilder.create()
                    .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                    .addBinaryBody("files", chartImage, ContentType.IMAGE_PNG, "chart.png")
                    .addTextBody("comments", 
                            MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath()));
            
            HttpUriRequest request = RequestBuilder
                    .post(generateUrl("files"))
                    .setEntity(entityBuilder.build())
                    .build();
                    
            executeRequest(client, request, errorDescription);
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }

    private String generateUrl(String type) {
        String domain = DATA_CENTER_DOMAINS.getOrDefault(cliq.getDataCenter().toLowerCase(), "cliq.zoho.eu");
        String url = String.format(
                "https://%s/api/v2/channelsbyname/%s/%s?zapikey=%s",
                domain, cliq.getChat(), type, cliq.getToken()
        );
        
        if (cliq.getBot() != null && !cliq.getBot().isEmpty()) {
            url += "&bot_unique_name=" + cliq.getBot();
        }
        
        return url;
    }

    private void executeRequest(CloseableHttpClient client, String uri, List<NameValuePair> formData,
            String errorDescription) throws MessageSendException {
        HttpUriRequest request = RequestBuilder
                .post(uri)
                .setEntity(new UrlEncodedFormEntity(formData, StandardCharsets.UTF_8))
                .build();
        executeRequest(client, request, errorDescription);
    }

    private void executeRequest(CloseableHttpClient client, HttpUriRequest request, String errorDescription)
            throws MessageSendException {
        try (CloseableHttpResponse responseBody = client.execute(request)) {
            int statusCode = responseBody.getStatusLine().getStatusCode();
            String responseAsString = EntityUtils.toString(responseBody.getEntity());

            if (statusCode != HttpStatus.SC_OK) {
                throw new MessageSendException(
                        String.format("%s. HTTP status code: %d, HTTP response: %s", errorDescription, statusCode,
                                responseAsString));
            }
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }
}
