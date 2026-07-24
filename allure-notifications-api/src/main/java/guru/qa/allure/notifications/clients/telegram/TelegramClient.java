package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.exceptions.MessageSendException;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.http.HttpClientFactory;
import guru.qa.allure.notifications.template.MessageTemplate;
import guru.qa.allure.notifications.template.data.MessageData;
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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class TelegramClient implements Notifier {
    private final Telegram telegram;
    private final Proxy proxy;

    public TelegramClient(Telegram telegram, Proxy proxy) {
        this.telegram = telegram;
        this.proxy = proxy;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        List<NameValuePair> formData = new ArrayList<>();
        formData.add(new BasicNameValuePair("text",
                MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath())));
        addCommonFormFields(formData);

        executeFormRequest("sendMessage", formData, "Failed to send Telegram message");
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        String caption = MessageTemplate.createMessageFromTemplate(messageData, telegram.getTemplatePath());
        executeMultipartRequest("sendPhoto", chartImage, caption, "Failed to send Telegram photo");
    }

    private void executeFormRequest(String method, List<NameValuePair> formData, String errorDescription)
            throws MessagingException {
        String uri = buildUri(method);
        HttpUriRequest request = RequestBuilder.post(uri)
                .setEntity(new UrlEncodedFormEntity(formData, StandardCharsets.UTF_8))
                .build();
        executeRequest(request, errorDescription);
    }

    private void executeMultipartRequest(String method, byte[] chartImage, String caption, String errorDescription)
            throws MessagingException {
        MultipartEntityBuilder entityBuilder = MultipartEntityBuilder.create()
                .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                .addBinaryBody("photo", chartImage, ContentType.create("image/png"), "chart.png")
                .addTextBody("caption", caption, ContentType.TEXT_PLAIN.withCharset(StandardCharsets.UTF_8))
                .addTextBody("chat_id", telegram.getChat(), ContentType.TEXT_PLAIN.withCharset(StandardCharsets.UTF_8))
                .addTextBody("parse_mode", "HTML", ContentType.TEXT_PLAIN.withCharset(StandardCharsets.UTF_8));

        if (telegram.getReplyTo() != null) {
            entityBuilder.addTextBody("reply_to_message_id", telegram.getReplyTo(),
                    ContentType.TEXT_PLAIN.withCharset(StandardCharsets.UTF_8));
        }
        if (telegram.getTopic() != null) {
            entityBuilder.addTextBody("message_thread_id", telegram.getTopic(),
                    ContentType.TEXT_PLAIN.withCharset(StandardCharsets.UTF_8));
        }

        HttpUriRequest request = RequestBuilder.post(buildUri(method))
                .setEntity(entityBuilder.build())
                .build();
        executeRequest(request, errorDescription);
    }

    private void addCommonFormFields(List<NameValuePair> formData) {
        formData.add(new BasicNameValuePair("chat_id", telegram.getChat()));
        formData.add(new BasicNameValuePair("parse_mode", "HTML"));

        if (telegram.getReplyTo() != null) {
            formData.add(new BasicNameValuePair("reply_to_message_id", telegram.getReplyTo()));
        }
        if (telegram.getTopic() != null) {
            formData.add(new BasicNameValuePair("message_thread_id", telegram.getTopic()));
        }
    }

    private String buildUri(String method) {
        return "https://api.telegram.org/bot" + telegram.getToken() + "/" + method;
    }

    private void executeRequest(HttpUriRequest request, String errorDescription) throws MessagingException {
        try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
            try (CloseableHttpResponse response = client.execute(request)) {
                EntityUtils.consume(response.getEntity());
            }
        } catch (IOException e) {
            throw new MessageSendException(errorDescription, e);
        }
    }
}
