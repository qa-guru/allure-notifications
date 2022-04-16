package guru.qa.allure.notifications.clients.slack;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.clients.client.BaseClient;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.template.MarkdownTemplate;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class SlackClient implements Notifier {
    private static final String POST_MESSAGE = "https://slack.com/api/chat.postMessage";
    private static final String FILES_UPLOAD = "https://slack.com/api/files.upload";

    private final Slack slack = ApplicationConfig.newInstance()
            .readConfig().slack();
    private final MarkdownTemplate markdownTemplate = new MarkdownTemplate();

    @Override
    public void sendText() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + slack.token());
        headers.put("Content-Type", Headers.URL_ENCODED.header());
        String body = String.format("channel=%s&text=%s",
                slack.chat(), markdownTemplate.create());

        new BaseClient().post(
                POST_MESSAGE,
                headers,
                body
        );
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + slack.token());
        Map<String, Object> fields = new HashMap<>();
        fields.put("file", new File("chart.png"));
        fields.put("channels", slack.chat());
        fields.put("filename", " ");
        fields.put("initial_comment", markdownTemplate.create());

        new BaseClient().post(
                FILES_UPLOAD,
                headers,
                fields
        );
    }
}
