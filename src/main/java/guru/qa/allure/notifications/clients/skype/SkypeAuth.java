package guru.qa.allure.notifications.clients.skype;

import com.jayway.jsonpath.JsonPath;

import guru.qa.allure.notifications.config.skype.Skype;
import kong.unirest.ContentType;
import kong.unirest.Unirest;

public class SkypeAuth {

    public static String bearerToken(Skype skype) {
        String body = Unirest.post("https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token")
                .header("Content-Type", ContentType.APPLICATION_FORM_URLENCODED.getMimeType())
                .field("grant_type", "client_credentials")
                .field("client_id", skype.getAppId())
                .field("client_secret", skype.getAppSecret())
                .field("scope", "https://api.botframework.com/.default")
                .asString()
                .getBody();

        return JsonPath.read(body, "$.access_token");
    }
}
