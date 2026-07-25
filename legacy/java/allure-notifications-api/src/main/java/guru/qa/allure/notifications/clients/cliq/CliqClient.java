package guru.qa.allure.notifications.clients.cliq;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.http.HttpClientFactory;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.config.proxy.Proxy;
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
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import kong.unirest.json.JSONArray;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CliqClient implements Notifier {

    private static final Map<String, String> DATA_CENTER_DOMAINS = new HashMap<>();

    private final Cliq cliq;
    private final Proxy proxy;

    static {
        DATA_CENTER_DOMAINS.put("com", "cliq.zoho.com");
        DATA_CENTER_DOMAINS.put("eu", "cliq.zoho.eu");
        DATA_CENTER_DOMAINS.put("in", "cliq.zoho.in");
        DATA_CENTER_DOMAINS.put("au", "cliq.zoho.com.au");
        DATA_CENTER_DOMAINS.put("jp", "cliq.zoho.jp");
        DATA_CENTER_DOMAINS.put("ca", "cliq.zohocloud.ca");
    }

    public CliqClient(Cliq cliq, Proxy proxy) {
        this.cliq = cliq;
        this.proxy = proxy;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        String errorDescription = "Failed to post message to Zoho Cliq";
        
        List<NameValuePair> formData = new ArrayList<>();
        formData.add(new BasicNameValuePair("text", 
                MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath())));
        
        HttpUriRequest request = RequestBuilder
                .post(generateUrl("message"))
                .setEntity(new UrlEncodedFormEntity(formData, StandardCharsets.UTF_8))
                .build();
                
        executeRequest(request, errorDescription);
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        String errorDescription = "Failed to post message with file to Zoho Cliq";
        
        JSONArray commentsArray = new JSONArray();
        commentsArray.put(MessageTemplate.createMessageFromTemplate(messageData, cliq.getTemplatePath()));
        
        MultipartEntityBuilder entityBuilder = MultipartEntityBuilder.create()
                .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                .addBinaryBody("files", chartImage, ContentType.IMAGE_PNG, "chart.png")
                .addTextBody("comments", commentsArray.toString());
        
        HttpUriRequest request = RequestBuilder
                .post(generateUrl("files"))
                .setEntity(entityBuilder.build())
                .build();
                
        executeRequest(request, errorDescription);
    }

    private String generateUrl(String type) {
        String dataCenter = cliq.getDataCenter().toLowerCase();
        if (!DATA_CENTER_DOMAINS.containsKey(dataCenter)) {
            throw new IllegalArgumentException("Unsupported data center: " + dataCenter + 
                ". Supported data centers: " + DATA_CENTER_DOMAINS.keySet());
        }
        
        String domain = DATA_CENTER_DOMAINS.get(dataCenter);
        
        StringBuilder urlBuilder = new StringBuilder();
        urlBuilder.append("https://")
                  .append(domain)
                  .append("/api/v2/channelsbyname/")
                  .append(cliq.getChat())
                  .append("/")
                  .append(type)
                  .append("?zapikey=")
                  .append(cliq.getToken());
        
        if (cliq.getBot() != null && !cliq.getBot().isEmpty()) {
            urlBuilder.append("&bot_unique_name=").append(cliq.getBot());
        }
        
        return urlBuilder.toString();
    }

    private void executeRequest(HttpUriRequest request, String errorDescription) throws MessageSendException {
        try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy);
            CloseableHttpResponse responseBody = client.execute(request)) {
            int statusCode = responseBody.getStatusLine().getStatusCode();

            if (statusCode == HttpStatus.SC_OK || statusCode == HttpStatus.SC_NO_CONTENT) {
                return;
            }

            String responseAsString = "";
            if (responseBody.getEntity() != null) {
                responseAsString = EntityUtils.toString(responseBody.getEntity());
            }

            throw new MessageSendException(
                    String.format("%s. HTTP status code: %d, HTTP response: %s", errorDescription, statusCode,
                            responseAsString));
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }
}
