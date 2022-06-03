package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.telegram.Telegram;
import guru.qa.allure.notifications.template.HTMLTemplate;
import kong.unirest.Unirest;

import java.io.File;

public class TelegramClient implements Notifier {
    private final Base base;
    private final Telegram telegram;
    private final HTMLTemplate htmlTemplate;

    public TelegramClient(Base base, Telegram telegram) {
        this.base = base;
        this.telegram = telegram;
        this.htmlTemplate = new HTMLTemplate(base);
    }

    @Override
    public void sendText() {
        Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", telegram.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo() + "")
                .field("text", htmlTemplate.create())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart(base);
        Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", telegram.token())
                .field("photo",
                        new File("chart.png"))
                .field("chat_id", telegram.chat())
                .field("reply_to_message_id", telegram.replyTo())
                .field("caption", htmlTemplate.create())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }
}
