package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Bot;
import guru.qa.allure.notifications.message.MessageText;
import kong.unirest.Unirest;

import java.io.File;

public class Slack implements Notifier {
    @Override
    public void sendText() {
        final String body = String.format("channel=%s&text=%s",
                Bot.chat(), MessageText.markdown());

        Unirest.post("https://slack.com/api/chat.postMessage")
                .header("Authorization", "Bearer " + Bot.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Unirest.post("https://slack.com/api/files.upload")
                .header("Authorization", "Bearer " + Bot.token())
                .field("file",
                        new File(Base.chartName() + ".png"))
                .field("channels", Bot.chat())
                .field("filename", " ")
                .field("initial_comment", MessageText.markdown())
                .asString()
                .getBody();
    }
}
