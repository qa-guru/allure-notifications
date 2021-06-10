package guru.qa.allure.notifications.clients.mattermost;

import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Bot;
import guru.qa.allure.notifications.message.MessageText;
import kong.unirest.Unirest;

import java.util.HashMap;
import java.util.Map;

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
}
