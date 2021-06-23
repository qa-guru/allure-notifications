package guru.qa.allure.notifications.clients.skype;

import com.jayway.jsonpath.JsonPath;
import guru.qa.allure.notifications.clients.Headers;
import guru.qa.allure.notifications.config.helpers.SkypeSettings;
import kong.unirest.Unirest;

public class SkypeAuth {
    public static String bearerToken() {
        String body = Unirest.post("https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token")
                .header("Content-Type", Headers.URL_ENCODED.header())
                .field("grant_type", "client_credentials")
                .field("client_id", SkypeSettings.appId())
                .field("client_secret", SkypeSettings.appSecret())
                .field("scope", "https://api.botframework.com/.default")
                .asString()
                .getBody();

        return JsonPath.read(body, "$.access_token");
    }
}
