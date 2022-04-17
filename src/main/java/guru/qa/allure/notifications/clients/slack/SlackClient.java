package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.Unirest;

import java.io.File;

public class SlackClient implements Notifier {
    private final Slack slack = ApplicationConfig.newInstance()
            .readConfig().slack();
    private final MarkdownTemplate markdownTemplate = new MarkdownTemplate();

    @Override
    public void sendText() {
        String body = String.format("channel=%s&text=%s",
                slack.chat(), markdownTemplate.create());

        Unirest.post("https://slack.com/api/chat.postMessage")
                .header("Authorization", "Bearer " + slack.token())
                .header("Content-Type", Headers.URL_ENCODED.header())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();

        Unirest.post("https://slack.com/api/files.upload")
                .header("Authorization", "Bearer " + slack.token())
                .field("file",
                        new File("chart.png"))
                .field("channels", slack.chat())
                .field("filename", " ")
                .field("initial_comment", markdownTemplate.create())
                .asString()
                .getBody();
    }
}
