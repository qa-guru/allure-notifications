package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.client.BaseClient;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.template.HTMLTemplate;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class TelegramClient implements Notifier {
    private static final String SEND_MESSAGE = "https://api.telegram.org/bot{token}/sendMessage";
    private static final String SEND_PHOTO = "https://api.telegram.org/bot{token}/sendPhoto";

    private final Telegram telegram = ApplicationConfig.newInstance()
            .readConfig().telegram();
    private final HTMLTemplate htmlTemplate = new HTMLTemplate();


    @Override
    public void sendText() {
        send(SEND_MESSAGE, false);
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        send(SEND_PHOTO, true);
    }

    private void send(String url, boolean isChartEnabled) {
        Map<String, Object> routes = new HashMap<>();
        routes.put("token", telegram.token());
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", Headers.URL_ENCODED.header());
        Map<String, Object> fields = new HashMap<>();
        if (isChartEnabled) {
            fields.put("photo", new File("chart.png"));
            fields.put("caption", htmlTemplate.create());
        } else {
            fields.put("text", htmlTemplate.create());
        }
        fields.put("chat_id", telegram.chat());
        fields.put("reply_to_message_id", telegram.replyTo());
        fields.put("parse_mode", "HTML");

        new BaseClient().post(
                url,
                routes,
                headers,
                fields
        );
    }
}
