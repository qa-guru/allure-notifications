package allure.notifications;

import allure.notifications.clients.BaseClient;
import allure.notifications.options.CmdOptions;
import allure.notifications.options.OptionsValues;
import com.beust.jcommander.JCommander;
import io.restassured.response.ValidatableResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

import static io.restassured.RestAssured.given;

public class Application {
    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        ValidatableResponse response =
                given()
                        .formParam("chat_id", "-1001200975738")
                        .formParam("caption", "sdfsd")
                        .multiPart("photo", new File("piechart.png"))
                        .post("https://api.telegram.org/bot1659734527:AAH4Muu7fRtV4CtPGkXn9nGdJ5Q9wKcMCiQ/sendPhoto")
                        .then();

        LOGGER.info("Start application");
        CmdOptions options = new CmdOptions();
        JCommander.newBuilder()
                .addObject(options)
                .build()
                .parse(args); // replace args by Utils.debugArgs() for debug
        OptionsValues values = options.collectOptions();
        BaseClient.sendMessage(values);
        LOGGER.info("Stop application");
    }
}
