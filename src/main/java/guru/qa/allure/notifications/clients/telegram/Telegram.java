package guru.qa.allure.notifications.clients.telegram;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Bot;
import guru.qa.allure.notifications.message.MessageText;
import kong.unirest.Unirest;

import java.io.File;

public class Telegram implements Notifier {
    @Override
    public void sendText() {
        Unirest.post("https://api.telegram.org/bot{token}/sendMessage")
                .routeParam("token", Bot.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .field("chat_id", Bot.chat())
                .field("reply_to_message_id", Bot.replyTo() + "")
                .field("text", MessageText.html())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Unirest.post("https://api.telegram.org/bot{token}/sendPhoto")
                .routeParam("token", Bot.token())
                .field("photo",
                        new File(Base.chartName() + ".png"))
                .field("chat_id", Bot.chat())
                .field("reply_to_message_id", Bot.replyTo() + "")
                .field("caption", MessageText.html())
                .field("parse_mode", "HTML")
                .asString()
                .getBody();
    }
}
