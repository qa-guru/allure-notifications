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
