package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.Unirest;

import java.io.File;

public class SlackClient implements Notifier {
    private final Base base;
    private final Slack slack;
    private final MarkdownTemplate markdownTemplate;

    public SlackClient(Base base, Slack slack) {
        this.base = base;
        this.slack = slack;
        this.markdownTemplate = new MarkdownTemplate(base);
    }

    @Override
    public void sendText() throws MessagingException {
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
    public void sendPhoto() throws MessagingException {
        Chart.createChart(base);

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
