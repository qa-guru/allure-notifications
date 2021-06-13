package guru.qa.allure.notifications.clients.mattermost;

import com.jayway.jsonpath.JsonPath;
import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Bot;
import guru.qa.allure.notifications.message.MessageText;
import kong.unirest.Unirest;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static java.util.Collections.singletonList;

public class Mattermost implements Notifier {
    private final Map<String, Object> body = new HashMap<>();

    @Override
    public void sendText() {
        body.put("channel_id", Bot.chat());
        body.put("message", MessageText.markdown());

        Unirest.post("https://{uri}/api/v4/posts")
                .routeParam("uri", Base.mattermostUrl())
                .header("Authorization", "Bearer " + Bot.token())
                .header("Content-Type", Headers.JSON.header())
                .body(body)
                .asString()
                .getBody();
    }

    @Override
    public void sendPhoto() {
        Chart.createChart();
        String response = Unirest.post("https://{uri}/api/v4/files")
                .routeParam("uri", Base.mattermostUrl())
                .header("Authorization", "Bearer " + Bot.token())
                .queryString("channel_id", Bot.chat())
                .queryString("filename", Base.chartName())
                .field(Base.chartName(),
                        new File(Base.chartName() + ".png"))
                .asString()
                .getBody();

        String chartId = JsonPath.read(response, "$.file_infos[0].id");
        body.put("file_ids", singletonList(chartId));
        sendText();
    }
}
