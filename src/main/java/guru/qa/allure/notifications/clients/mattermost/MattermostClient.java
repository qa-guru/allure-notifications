package guru.qa.allure.notifications.clients.mattermost;

import com.jayway.jsonpath.JsonPath;
import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.config.enums.Headers;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.MarkdownTemplate;
import kong.unirest.Unirest;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static java.util.Collections.singletonList;

public class MattermostClient implements Notifier {
    private final Map<String, Object> body = new HashMap<>();
    private final String url = ApplicationConfig.newInstance().readConfig()
            .mattermost().url();
    private final Mattermost mattermost = ApplicationConfig.newInstance()
            .readConfig().mattermost();

    @Override
    public void sendText() throws MessagingException {
        body.put("channel_id", mattermost.chat());
        body.put("message", new MarkdownTemplate().create());

        Unirest.post("https://{uri}/api/v4/posts")
                .routeParam("uri", url)
                .header("Authorization", "Bearer " +
                        mattermost.token())
                .header("Content-Type", Headers.JSON.header())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() throws MessagingException {
        Chart.createChart();
        String response = Unirest.post("https://{uri}/api/v4/files")
                .routeParam("uri", url)
                .header("Authorization", "Bearer " +
                        mattermost.token())
                .queryString("channel_id", mattermost.chat())
                .queryString("filename", "chart")
                .field("chart",
                        new File("chart.png"))
                .asString()
                .getBody();

        String chartId = JsonPath.read(response, "$.file_infos[0].id");
        body.put("file_ids", singletonList(chartId));
        sendText();
    }
}
